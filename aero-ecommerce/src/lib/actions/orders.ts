"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, payments } from "@/lib/db/schema/orders";
import { addresses } from "@/lib/db/schema/addresses";
import { cartItems, carts } from "@/lib/db/schema/carts";
import { productVariants } from "@/lib/db/schema/products";
import { coupons } from "@/lib/db/schema/coupons";
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
// Idempotent — safe to call multiple times for the same session.

export async function createOrder(
  stripeSession: Stripe.Checkout.Session
): Promise<string | null> {
  if (!db) return null;

  const { cartId, userId, couponCode } = stripeSession.metadata ?? {};
  const guestEmail = stripeSession.customer_details?.email ?? undefined;

  // ── Idempotency check ──────────────────────────────────────────────────────
  const existing = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.transactionId, stripeSession.id))
    .limit(1);
  if (existing.length > 0) {
    console.log("[orders] Duplicate webhook — skipping:", stripeSession.id);
    return null;
  }

  // ── Collect cart items before clearing ────────────────────────────────────
  let cartRows: { productVariantId: string; quantity: number; price: string; salePrice: string | null }[] = [];
  if (cartId) {
    cartRows = await db
      .select({
        productVariantId: cartItems.productVariantId,
        quantity: cartItems.quantity,
        price: productVariants.price,
        salePrice: productVariants.salePrice,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .where(eq(cartItems.cartId, cartId));
  }

  const totalAmount = ((stripeSession.amount_total ?? 0) / 100).toFixed(2);

  // ── Wrap everything in a transaction ──────────────────────────────────────
  // Note: Neon HTTP driver doesn't support true transactions, so we do
  // sequential operations with idempotency guard above as the safety net.

  // ── Build addresses from Stripe data ──────────────────────────────────────
  // We make address FKs nullable (Task 2) so guests without a userId can still
  // have an order record. For authenticated users we create address rows.
  let shippingAddressId: string | undefined;
  let billingAddressId: string | undefined;

  const collectedInfo = (stripeSession as unknown as {
    collected_information?: { shipping_details?: { address?: Stripe.Address } };
  }).collected_information;
  const shippingAddr = collectedInfo?.shipping_details?.address;
  const billingAddr = stripeSession.customer_details?.address;

  if (userId && shippingAddr) {
    const [shippingRow] = await db
      .insert(addresses)
      .values({
        userId,
        type: "shipping",
        line1: shippingAddr.line1 ?? "",
        line2: shippingAddr.line2 ?? undefined,
        city: shippingAddr.city ?? "",
        state: shippingAddr.state ?? "",
        country: shippingAddr.country ?? "",
        postalCode: shippingAddr.postal_code ?? "",
      })
      .returning({ id: addresses.id });
    shippingAddressId = shippingRow.id;
  }

  if (userId && billingAddr) {
    const [billingRow] = await db
      .insert(addresses)
      .values({
        userId,
        type: "billing",
        line1: billingAddr.line1 ?? "",
        line2: billingAddr.line2 ?? undefined,
        city: billingAddr.city ?? "",
        state: billingAddr.state ?? "",
        country: billingAddr.country ?? "",
        postalCode: billingAddr.postal_code ?? "",
      })
      .returning({ id: addresses.id });
    billingAddressId = billingRow.id;
  }

  // ── Create order ──────────────────────────────────────────────────────────
  const [order] = await db
    .insert(orders)
    .values({
      userId: userId ?? undefined,
      guestEmail: userId ? undefined : guestEmail,
      status: "paid",
      totalAmount,
      shippingAddressId,
      billingAddressId,
      couponCode: couponCode ?? undefined,
    })
    .returning({ id: orders.id });

  // ── Create order items + decrement inventory ───────────────────────────────
  if (cartRows.length > 0) {
    await db.insert(orderItems).values(
      cartRows.map((r) => ({
        orderId: order.id,
        productVariantId: r.productVariantId,
        quantity: r.quantity,
        priceAtPurchase: r.salePrice ?? r.price,
      }))
    );

    // Decrement inStock for each variant
    for (const row of cartRows) {
      await db
        .update(productVariants)
        .set({ inStock: sql`greatest(${productVariants.inStock} - ${row.quantity}, 0)` })
        .where(eq(productVariants.id, row.productVariantId));
    }

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId!));
    await db.delete(carts).where(eq(carts.id, cartId!));
  }

  // ── Increment coupon usage ─────────────────────────────────────────────────
  if (couponCode) {
    await db
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1` })
      .where(eq(coupons.code, couponCode));
  }

  // ── Record payment ─────────────────────────────────────────────────────────
  await db.insert(payments).values({
    orderId: order.id,
    method: "stripe",
    status: "completed",
    paidAt: new Date(),
    transactionId: stripeSession.id,
  });

  console.log(`[orders] Created order ${order.id} for ${userId ? `user ${userId}` : `guest ${guestEmail}`}`);
  return order.id;
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
