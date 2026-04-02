"use server";

import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { user } from "@/lib/db/schema/user";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Admin guard ──────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthenticated");

  if (!db) throw new Error("DB unavailable");
  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!rows.length || rows[0].role !== "admin") throw new Error("Forbidden");
  return session.user.id;
}

// ─── toggleProductPublished ───────────────────────────────────────────────────

export async function toggleProductPublished(
  productId: string
): Promise<{ data: { isPublished: boolean } } | { error: string }> {
  const parsed = z.string().uuid().safeParse(productId);
  if (!parsed.success) return { error: "Invalid product ID." };

  try {
    await requireAdmin();
    if (!db) return { error: "Service unavailable." };

    const rows = await db
      .select({ isPublished: products.isPublished })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!rows.length) return { error: "Product not found." };

    const next = !rows[0].isPublished;
    await db.update(products).set({ isPublished: next }).where(eq(products.id, productId));

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { data: { isPublished: next } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Forbidden") return { error: "Admin access required." };
    console.error("[admin] toggleProductPublished error:", e);
    return { error: "Failed to update product." };
  }
}

// ─── updateOrderStatus — delegates to OrderService ───────────────────────────

const orderStatusValues = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(orderStatusValues),
});

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ data: { status: string } } | { error: string }> {
  const parsed = updateOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const actorId = await requireAdmin();
    const { OrderService } = await import("@/lib/services/order.service");
    const result = await OrderService.updateStatus(
      parsed.data.orderId,
      parsed.data.status,
      actorId
    );

    if (result.error) {
      if (result.error === "ORDER_NOT_FOUND") return { error: "Order not found." };
      if (result.error.startsWith("INVALID_TRANSITION")) {
        return { error: `Invalid status transition: ${result.error.split(": ")[1] ?? ""}` };
      }
      return { error: result.error };
    }

    revalidatePath("/admin/orders");
    return { data: { status: result.data!.status } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Forbidden") return { error: "Admin access required." };
    console.error("[admin] updateOrderStatus error:", e);
    return { error: "Failed to update order." };
  }
}

// ─── updateInventory ──────────────────────────────────────────────────────────

const updateInventorySchema = z.object({
  variantId: z.string().uuid(),
  inStock: z.number().int().min(0),
});

export async function updateInventory(
  variantId: string,
  inStock: number
): Promise<{ data: { inStock: number } } | { error: string }> {
  const parsed = updateInventorySchema.safeParse({ variantId, inStock });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await requireAdmin();
    if (!db) return { error: "Service unavailable." };

    await db
      .update(productVariants)
      .set({ inStock: parsed.data.inStock })
      .where(eq(productVariants.id, variantId));

    revalidatePath("/admin/inventory");
    return { data: { inStock: parsed.data.inStock } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Forbidden") return { error: "Admin access required." };
    console.error("[admin] updateInventory error:", e);
    return { error: "Failed to update inventory." };
  }
}
