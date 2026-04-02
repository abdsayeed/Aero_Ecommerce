import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { StockReservationRepository } from "@/lib/repositories/stockReservation.repository";
import { AuditLogRepository } from "@/lib/repositories/auditLog.repository";
import { enqueueJob } from "@/lib/jobs";
import { cartItems, carts } from "@/lib/db/schema/carts";
import { productVariants } from "@/lib/db/schema/products";
import { orders } from "@/lib/db/schema/orders";
import { addresses } from "@/lib/db/schema/addresses";
import type Stripe from "stripe";
import type { ServiceResult } from "./auth.service";

// Valid order status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const OrderService = {
  async createFromStripeSession(
    stripeSession: Stripe.Checkout.Session
  ): Promise<ServiceResult<string>> {
    try {
      if (!db) return { data: null, error: "DB_UNAVAILABLE" };

      // Idempotency check
      const existingOrderId = await OrderRepository.findByTransactionId(stripeSession.id);
      if (existingOrderId) {
        logger.info({ sessionId: stripeSession.id }, "Duplicate webhook — returning existing order");
        return { data: existingOrderId, error: null };
      }

      const { cartId, userId, couponCode } = stripeSession.metadata ?? {};
      const guestEmail = stripeSession.customer_details?.email ?? undefined;
      const totalAmount = ((stripeSession.amount_total ?? 0) / 100).toFixed(2);

      // Collect cart items
      let cartRows: { productVariantId: string; quantity: number; price: string; salePrice: string | null; sku: string; inStock: number }[] = [];
      if (cartId) {
        cartRows = await db
          .select({
            productVariantId: cartItems.productVariantId,
            quantity: cartItems.quantity,
            price: productVariants.price,
            salePrice: productVariants.salePrice,
            sku: productVariants.sku,
            inStock: productVariants.inStock,
          })
          .from(cartItems)
          .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
          .where(eq(cartItems.cartId, cartId));
      }

      // Build addresses from Stripe data
      const collectedInfo = (stripeSession as unknown as {
        collected_information?: { shipping_details?: { address?: Stripe.Address } };
      }).collected_information;
      const shippingAddr = collectedInfo?.shipping_details?.address;
      const billingAddr = stripeSession.customer_details?.address;

      const shippingAddress =
        userId && shippingAddr
          ? {
              userId,
              type: "shipping" as const,
              line1: shippingAddr.line1 ?? "",
              line2: shippingAddr.line2 ?? undefined,
              city: shippingAddr.city ?? "",
              state: shippingAddr.state ?? "",
              country: shippingAddr.country ?? "",
              postalCode: shippingAddr.postal_code ?? "",
            }
          : undefined;

      const billingAddress =
        userId && billingAddr
          ? {
              userId,
              type: "billing" as const,
              line1: billingAddr.line1 ?? "",
              line2: billingAddr.line2 ?? undefined,
              city: billingAddr.city ?? "",
              state: billingAddr.state ?? "",
              country: billingAddr.country ?? "",
              postalCode: billingAddr.postal_code ?? "",
            }
          : undefined;

      const order = await OrderRepository.createWithItems({
        order: {
          userId: userId ?? undefined,
          guestEmail: userId ? undefined : guestEmail,
          status: "paid",
          totalAmount,
          couponCode: couponCode ?? undefined,
        },
        items: cartRows.map((r) => ({
          productVariantId: r.productVariantId,
          quantity: r.quantity,
          priceAtPurchase: r.salePrice ?? r.price,
        })),
        payment: {
          method: "stripe",
          status: "completed",
          paidAt: new Date(),
          transactionId: stripeSession.id,
        },
        shippingAddress,
        billingAddress,
      });

      if (!order) return { data: null, error: "ORDER_CREATE_FAILED" };

      // Decrement inventory
      for (const row of cartRows) {
        await db
          .update(productVariants)
          .set({ inStock: sql`greatest(${productVariants.inStock} - ${row.quantity}, 0)` })
          .where(eq(productVariants.id, row.productVariantId));

        // Check low stock and alert
        const newStock = Math.max(row.inStock - row.quantity, 0);
        if (newStock <= 5) {
          await enqueueJob("send-low-stock-alert", {
            variantId: row.productVariantId,
            productName: row.sku,
            sku: row.sku,
            inStock: newStock,
            threshold: 5,
          });
        }
      }

      // Increment coupon usage
      if (couponCode) {
        await CouponRepository.incrementUsage(couponCode);
      }

      // Clean up stock reservations
      await StockReservationRepository.deleteBySessionId(stripeSession.id);

      // Clear cart
      if (cartId) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
        await db.delete(carts).where(eq(carts.id, cartId));
      }

      // Audit log
      await AuditLogRepository.create({
        actorId: userId ?? "guest",
        action: "order.created",
        resourceType: "order",
        resourceId: order.id,
        after: { totalAmount, status: "paid" },
      });

      // Enqueue order confirmation email
      await enqueueJob("send-order-confirmation", {
        orderId: order.id,
        to: userId ? stripeSession.customer_details?.email ?? "" : guestEmail ?? "",
      });

      logger.info({ orderId: order.id, sessionId: stripeSession.id }, "Order created");
      return { data: order.id, error: null };
    } catch (e) {
      logger.error({ err: e }, "OrderService.createFromStripeSession failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },

  async updateStatus(
    id: string,
    newStatus: typeof orders.$inferSelect["status"],
    actorId: string
  ): Promise<ServiceResult<typeof orders.$inferSelect>> {
    try {
      const order = await OrderRepository.findById(id);
      if (!order) return { data: null, error: "ORDER_NOT_FOUND" };

      const allowed = VALID_TRANSITIONS[order.status] ?? [];
      if (!allowed.includes(newStatus)) {
        return {
          data: null,
          error: `INVALID_TRANSITION: ${order.status} → ${newStatus}`,
        };
      }

      const updated = await OrderRepository.updateStatus(id, newStatus);
      if (!updated) return { data: null, error: "UPDATE_FAILED" };

      await AuditLogRepository.create({
        actorId,
        action: "order.status_change",
        resourceType: "order",
        resourceId: id,
        before: { status: order.status },
        after: { status: newStatus },
      });

      if (newStatus === "shipped") {
        await enqueueJob("send-order-confirmation", { orderId: id, to: "" });
      }

      return { data: updated, error: null };
    } catch (e) {
      logger.error({ err: e, orderId: id }, "OrderService.updateStatus failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },

  async getOrder(id: string) {
    return OrderRepository.findById(id);
  },

  async getOrdersByUser(userId: string) {
    return OrderRepository.findByUserId(userId);
  },
};
