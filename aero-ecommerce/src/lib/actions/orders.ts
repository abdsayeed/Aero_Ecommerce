"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, payments } from "@/lib/db/schema/orders";
import { addresses } from "@/lib/db/schema/addresses";
import { cartItems, carts } from "@/lib/db/schema/carts";
import { productVariants } from "@/lib/db/schema/products";
import { coupons } from "@/lib/db/schema/coupons";
import { AuthService } from "@/lib/services/auth.service";
import { OrderService } from "@/lib/services/order.service";
import type Stripe from "stripe";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderDetail = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  stripeSessionId: string | null;
  items: {
    id: string;
    productVariantId: string;
    quantity: number;
    priceAtPurchase: string;
  }[];
};

// ─── createOrder ──────────────────────────────────────────────────────────────
// Called from the Stripe webhook on checkout.session.completed.
// Delegates to OrderService for idempotency and business logic.

export async function createOrder(
  stripeSession: Stripe.Checkout.Session
): Promise<string | null> {
  const result = await OrderService.createFromStripeSession(stripeSession);
  return result.data;
}

// ─── getOrder ─────────────────────────────────────────────────────────────────

export async function getOrder(orderId: string): Promise<OrderDetail | null> {
  if (!db) return null;
  try {
    const orderRows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!orderRows.length) return null;
    const order = orderRows[0];

    const items = await db
      .select({
        id: orderItems.id,
        productVariantId: orderItems.productVariantId,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const paymentRows = await db
      .select({ transactionId: payments.transactionId })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      stripeSessionId: paymentRows[0]?.transactionId ?? null,
      items,
    };
  } catch (e) {
    console.error("[orders] getOrder error:", e);
    return null;
  }
}

export async function getOrderByStripeSession(stripeSessionId: string): Promise<OrderDetail | null> {
  if (!db) return null;
  try {
    const paymentRows = await db
      .select({ orderId: payments.orderId })
      .from(payments)
      .where(eq(payments.transactionId, stripeSessionId))
      .limit(1);
    if (!paymentRows.length) return null;
    return getOrder(paymentRows[0].orderId);
  } catch {
    return null;
  }
}

// ─── getMyOrders — requires auth ──────────────────────────────────────────────

export async function getMyOrders(): Promise<OrderDetail[]> {
  const auth = await AuthService.requireAuth();
  if (auth.error) return [];

  const userOrders = await OrderService.getOrdersByUser(auth.data!.userId);
  const results: OrderDetail[] = [];

  for (const order of userOrders) {
    const detail = await getOrder(order.id);
    if (detail) results.push(detail);
  }

  return results;
}
