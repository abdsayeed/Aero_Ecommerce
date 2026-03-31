"use server";

import { eq, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/user";
import { orders, orderItems, payments } from "@/lib/db/schema/orders";
import { addresses } from "@/lib/db/schema/addresses";
import { productVariants, products, productImages } from "@/lib/db/schema/products";
import { colors } from "@/lib/db/schema/filters/colors";
import { sizes } from "@/lib/db/schema/filters/sizes";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderSummary = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  itemCount: number;
};

export type OrderFull = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  couponCode: string | null;
  stripeTransactionId: string | null;
  shippingAddress: {
    line1: string; line2: string | null; city: string;
    state: string; country: string; postalCode: string;
  } | null;
  items: {
    id: string;
    productName: string;
    colorName: string;
    sizeName: string;
    quantity: number;
    priceAtPurchase: string;
    image: string | null;
  }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return session.user.id;
}

// ─── getMyOrders ──────────────────────────────────────────────────────────────

export async function getMyOrders(): Promise<{ data: OrderSummary[] } | { error: string }> {
  try {
    const userId = await requireUserId();
    if (!db) return { data: [] };

    const rows = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    if (!rows.length) return { data: [] };

    const orderIds = rows.map((r) => r.id);

    // Fetch all item quantities in one query
    const allItems = await db
      .select({ orderId: orderItems.orderId, qty: orderItems.quantity })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const countMap = new Map<string, number>();
    for (const item of allItems) {
      countMap.set(item.orderId, (countMap.get(item.orderId) ?? 0) + item.qty);
    }

    return {
      data: rows.map((r) => ({
        id: r.id,
        status: r.status,
        totalAmount: r.totalAmount,
        createdAt: r.createdAt,
        itemCount: countMap.get(r.id) ?? 0,
      })),
    };
  } catch (e) {
    console.error("[account] getMyOrders error:", e);
    return { error: "Failed to load orders." };
  }
}

// ─── getMyOrder ───────────────────────────────────────────────────────────────

export async function getMyOrder(orderId: string): Promise<{ data: OrderFull } | { error: string }> {
  const idSchema = z.string().uuid();
  if (!idSchema.safeParse(orderId).success) return { error: "Invalid order ID." };

  try {
    const userId = await requireUserId();
    if (!db) return { error: "Service unavailable." };

    const orderRows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderRows.length) return { error: "Order not found." };
    const order = orderRows[0];

    // Verify ownership
    if (order.userId !== userId) return { error: "Access denied." };

    // Fetch items with product details
    const itemRows = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        productName: products.name,
        colorName: colors.name,
        sizeName: sizes.name,
        productId: products.id,
      })
      .from(orderItems)
      .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(colors, eq(productVariants.colorId, colors.id))
      .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
      .where(eq(orderItems.orderId, orderId));

    // Fetch images
    const productIds = [...new Set(itemRows.map((r) => r.productId))];
    const imageRows = productIds.length
      ? await db
          .select({ productId: productImages.productId, url: productImages.url })
          .from(productImages)
          .where(eq(productImages.isPrimary, true))
      : [];
    const imageMap = new Map(imageRows.map((i) => [i.productId, i.url]));

    // Fetch shipping address
    let shippingAddress: OrderFull["shippingAddress"] = null;
    if (order.shippingAddressId) {
      const addrRows = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, order.shippingAddressId))
        .limit(1);
      if (addrRows.length) {
        const a = addrRows[0];
        shippingAddress = { line1: a.line1, line2: a.line2 ?? null, city: a.city, state: a.state, country: a.country, postalCode: a.postalCode };
      }
    }

    // Stripe transaction ID (last 8 chars only for display)
    const paymentRows = await db
      .select({ transactionId: payments.transactionId })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);
    const txId = paymentRows[0]?.transactionId ?? null;

    return {
      data: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        couponCode: order.couponCode ?? null,
        stripeTransactionId: txId ? `...${txId.slice(-8)}` : null,
        shippingAddress,
        items: itemRows.map((r) => ({
          id: r.id,
          productName: r.productName,
          colorName: r.colorName,
          sizeName: r.sizeName,
          quantity: r.quantity,
          priceAtPurchase: r.priceAtPurchase,
          image: imageMap.get(r.productId) ?? null,
        })),
      },
    };
  } catch (e) {
    console.error("[account] getMyOrder error:", e);
    return { error: "Failed to load order." };
  }
}

// ─── updateProfile ────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
});

export async function updateProfile(
  formData: FormData
): Promise<{ data: { name: string } } | { error: string }> {
  const parsed = updateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const userId = await requireUserId();
    if (!db) return { error: "Service unavailable." };

    await db
      .update(user)
      .set({ name: parsed.data.name, updatedAt: new Date() })
      .where(eq(user.id, userId));

    revalidatePath("/account/profile");
    return { data: { name: parsed.data.name } };
  } catch (e) {
    console.error("[account] updateProfile error:", e);
    return { error: "Failed to update profile." };
  }
}

// ─── getProfile ───────────────────────────────────────────────────────────────

export async function getProfile(): Promise<{ data: { id: string; name: string | null; email: string } } | { error: string }> {
  try {
    const userId = await requireUserId();
    if (!db) return { error: "Service unavailable." };

    const rows = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!rows.length) return { error: "User not found." };
    return { data: rows[0] };
  } catch (e) {
    console.error("[account] getProfile error:", e);
    return { error: "Failed to load profile." };
  }
}
