import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe/client";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { StockReservationRepository } from "@/lib/repositories/stockReservation.repository";
import { cartItems } from "@/lib/db/schema/carts";
import { productVariants } from "@/lib/db/schema/products";
import type { ServiceResult } from "./auth.service";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const MINIMUM_CHARGE_CENTS = 50; // Stripe minimum: $0.50

export type CouponValidationResult = {
  discountType: "percentage" | "fixed";
  discountValue: string;
  discountedTotal: number;
};

export const CheckoutService = {
  async validateCoupon(
    code: string,
    cartTotalCents: number
  ): Promise<ServiceResult<CouponValidationResult>> {
    try {
      const coupon = await CouponRepository.findByCode(code);
      if (!coupon) return { data: null, error: "COUPON_NOT_FOUND" };

      if (new Date() > coupon.expiresAt) {
        return { data: null, error: "COUPON_EXPIRED" };
      }

      if (coupon.usedCount >= coupon.maxUsage) {
        return { data: null, error: "COUPON_EXHAUSTED" };
      }

      const discountValue = parseFloat(coupon.discountValue);
      let discountCents: number;

      if (coupon.discountType === "percentage") {
        discountCents = Math.floor((cartTotalCents * discountValue) / 100);
      } else {
        discountCents = Math.min(Math.round(discountValue * 100), cartTotalCents);
      }

      const discountedTotal = Math.max(cartTotalCents - discountCents, MINIMUM_CHARGE_CENTS);

      return {
        data: {
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountedTotal,
        },
        error: null,
      };
    } catch (e) {
      logger.error({ err: e, code }, "CheckoutService.validateCoupon failed");
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },

  async initiateCheckout(
    cartId: string,
    userId?: string,
    userEmail?: string,
    couponCode?: string
  ): Promise<ServiceResult<{ url: string }>> {
    try {
      if (!db) return { data: null, error: "DB_UNAVAILABLE" };

      // Load cart items with variant stock info
      const items = await db
        .select({
          productVariantId: cartItems.productVariantId,
          quantity: cartItems.quantity,
          price: productVariants.price,
          salePrice: productVariants.salePrice,
          inStock: productVariants.inStock,
          sku: productVariants.sku,
        })
        .from(cartItems)
        .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
        .where(eq(cartItems.cartId, cartId));

      if (items.length === 0) return { data: null, error: "CART_EMPTY" };

      // Verify stock
      for (const item of items) {
        if (item.inStock < item.quantity) {
          return { data: null, error: `INSUFFICIENT_STOCK:${item.sku}` };
        }
      }

      // Reserve stock: decrement inStock and insert reservation rows
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

      // Create Stripe session first to get session ID for reservation
      const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] =
        items.map((item) => ({
          price_data: {
            currency: "usd",
            unit_amount: Math.round(parseFloat(item.salePrice ?? item.price) * 100),
            product_data: { name: item.sku },
          },
          quantity: item.quantity,
        }));

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        shipping_address_collection: { allowed_countries: ["US", "GB", "CA", "AU", "AE"] },
        billing_address_collection: "required",
        ...(userEmail ? { customer_email: userEmail } : {}),
        metadata: {
          cartId,
          ...(userId ? { userId } : {}),
          ...(couponCode ? { couponCode } : {}),
        },
        success_url: `${BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/cart`,
      });

      if (!session.url) return { data: null, error: "STRIPE_SESSION_FAILED" };

      // Decrement stock and create reservations
      for (const item of items) {
        await db
          .update(productVariants)
          .set({ inStock: sql`greatest(${productVariants.inStock} - ${item.quantity}, 0)` })
          .where(eq(productVariants.id, item.productVariantId));
      }

      await StockReservationRepository.createMany(
        items.map((item) => ({
          stripeSessionId: session.id,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          expiresAt,
        }))
      );

      return { data: { url: session.url }, error: null };
    } catch (e) {
      logger.error({ err: e, cartId }, "CheckoutService.initiateCheckout failed");
      const msg = e instanceof Error ? e.message : "INTERNAL_ERROR";
      if (msg.includes("No API key") || msg.includes("Invalid API Key") || msg.includes("placeholder")) {
        return { data: null, error: "STRIPE_NOT_CONFIGURED" };
      }
      return { data: null, error: "INTERNAL_ERROR" };
    }
  },
};

// ─── expireStockReservations — called by scheduler job ───────────────────────

export async function expireStockReservations(): Promise<void> {
  if (!db) return;
  try {
    const expired = await StockReservationRepository.findExpired();
    for (const reservation of expired) {
      await db
        .update(productVariants)
        .set({ inStock: sql`${productVariants.inStock} + ${reservation.quantity}` })
        .where(eq(productVariants.id, reservation.productVariantId));
    }
    await StockReservationRepository.deleteExpired();
    logger.info({ count: expired.length }, "Expired stock reservations cleaned up");
  } catch (e) {
    logger.error({ err: e }, "expireStockReservations failed");
  }
}
