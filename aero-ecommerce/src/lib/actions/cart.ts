"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema/carts";
import { guest } from "@/lib/db/schema/guest";
import { products, productVariants, productImages } from "@/lib/db/schema/products";
import { colors } from "@/lib/db/schema/filters/colors";
import { sizes } from "@/lib/db/schema/filters/sizes";
import { guestSession, createGuestSession } from "@/lib/auth/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { CartLineItem } from "@/store/cart.store";

// ─── Return types ─────────────────────────────────────────────────────────────

export type CartResult = {
  cartId: string;
  items: CartLineItem[];
};

// ─── Session helpers ──────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function getOrCreateCart(): Promise<{ cartId: string; userId: string | null; guestDbId: string | null }> {
  if (!db) throw new Error("Database not available");

  const userId = await getCurrentUserId();

  if (userId) {
    // Authenticated user
    const existing = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (existing.length > 0) return { cartId: existing[0].id, userId, guestDbId: null };

    const [newCart] = await db.insert(carts).values({ userId }).returning({ id: carts.id });
    return { cartId: newCart.id, userId, guestDbId: null };
  }

  // Guest user
  let token = await guestSession();
  if (!token) token = await createGuestSession();

  // Look up guest row
  const guestRows = await db
    .select({ id: guest.id })
    .from(guest)
    .where(eq(guest.sessionToken, token))
    .limit(1);

  if (!guestRows.length) {
    token = await createGuestSession();
    const newGuest = await db
      .select({ id: guest.id })
      .from(guest)
      .where(eq(guest.sessionToken, token))
      .limit(1);
    if (!newGuest.length) throw new Error("Failed to create guest session");
    const guestDbId = newGuest[0].id;
    const [newCart] = await db.insert(carts).values({ guestId: guestDbId }).returning({ id: carts.id });
    return { cartId: newCart.id, userId: null, guestDbId };
  }

  const guestDbId = guestRows[0].id;

  const existingCart = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.guestId, guestDbId))
    .limit(1);

  if (existingCart.length > 0) return { cartId: existingCart[0].id, userId: null, guestDbId };

  const [newCart] = await db.insert(carts).values({ guestId: guestDbId }).returning({ id: carts.id });
  return { cartId: newCart.id, userId: null, guestDbId };
}

// ─── Build rich cart items from DB rows ───────────────────────────────────────

async function fetchCartItems(cartId: string): Promise<CartLineItem[]> {
  if (!db) return [];

  const rows = await db
    .select({
      cartItemId: cartItems.id,
      quantity: cartItems.quantity,
      variantId: productVariants.id,
      productId: products.id,
      productName: products.name,
      variantSku: productVariants.sku,
      price: productVariants.price,
      salePrice: productVariants.salePrice,
      inStock: productVariants.inStock,
      colorName: colors.name,
      colorHex: colors.hexCode,
      sizeName: sizes.name,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .innerJoin(colors, eq(productVariants.colorId, colors.id))
    .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
    .where(eq(cartItems.cartId, cartId));

  if (rows.length === 0) return [];

  // Collect unique product IDs
  const productIds = [...new Set(rows.map((r) => r.productId))];

  // Fetch primary images for all products in one query
  const imageRows = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(
      and(
        inArray(productImages.productId, productIds),
        eq(productImages.isPrimary, true)
      )
    );

  // Build image map
  const imageMap = new Map<string, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, img.url);
  }

  return rows.map((r) => ({
    cartItemId: r.cartItemId,
    variantId: r.variantId,
    productId: r.productId,
    productName: r.productName,
    variantSku: r.variantSku,
    colorName: r.colorName,
    colorHex: r.colorHex,
    sizeName: r.sizeName,
    price: r.price,
    salePrice: r.salePrice,
    image: imageMap.get(r.productId) ?? null,
    quantity: r.quantity,
    inStock: r.inStock,
  }));
}

// ─── getCart ──────────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartResult | null> {
  if (!db) return null;
  try {
    const { cartId } = await getOrCreateCart();
    const items = await fetchCartItems(cartId);
    return { cartId, items };
  } catch {
    return null;
  }
}

// ─── addCartItem ──────────────────────────────────────────────────────────────

export async function addCartItem(
  variantId: string,
  quantity = 1
): Promise<CartResult | null> {
  if (!db) return null;
  try {
    const { cartId } = await getOrCreateCart();

    // Check if variant already in cart
    const existing = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productVariantId, variantId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({ cartId, productVariantId: variantId, quantity });
    }

    const items = await fetchCartItems(cartId);
    return { cartId, items };
  } catch (e) {
    console.error("[cart] addCartItem error:", e);
    return null;
  }
}

// ─── updateCartItem ───────────────────────────────────────────────────────────

export async function updateCartItem(
  cartItemId: string,
  quantity: number
): Promise<CartResult | null> {
  if (!db) return null;
  try {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, cartItemId));
    }

    const { cartId } = await getOrCreateCart();
    const items = await fetchCartItems(cartId);
    return { cartId, items };
  } catch (e) {
    console.error("[cart] updateCartItem error:", e);
    return null;
  }
}

// ─── removeCartItem ───────────────────────────────────────────────────────────

export async function removeCartItem(cartItemId: string): Promise<CartResult | null> {
  if (!db) return null;
  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    const { cartId } = await getOrCreateCart();
    const items = await fetchCartItems(cartId);
    return { cartId, items };
  } catch (e) {
    console.error("[cart] removeCartItem error:", e);
    return null;
  }
}

// ─── clearCart ────────────────────────────────────────────────────────────────

export async function clearCart(): Promise<void> {
  if (!db) return;
  try {
    const { cartId } = await getOrCreateCart();
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  } catch (e) {
    console.error("[cart] clearCart error:", e);
  }
}

// ─── mergeGuestCart (called on login/signup) ──────────────────────────────────

export async function mergeGuestCart(guestToken: string, userId: string): Promise<void> {
  if (!db) return;
  try {
    // Find guest row
    const guestRows = await db
      .select({ id: guest.id })
      .from(guest)
      .where(eq(guest.sessionToken, guestToken))
      .limit(1);
    if (!guestRows.length) return;

    const guestDbId = guestRows[0].id;

    // Find guest cart
    const guestCart = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.guestId, guestDbId))
      .limit(1);
    if (!guestCart.length) return;

    const guestCartId = guestCart[0].id;

    // Find or create user cart
    let userCartId: string;
    const userCart = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    if (userCart.length > 0) {
      userCartId = userCart[0].id;
    } else {
      const [newCart] = await db.insert(carts).values({ userId }).returning({ id: carts.id });
      userCartId = newCart.id;
    }

    // Move guest cart items to user cart
    const guestItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, guestCartId));

    for (const item of guestItems) {
      const existing = await db
        .select({ id: cartItems.id, quantity: cartItems.quantity })
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, userCartId),
            eq(cartItems.productVariantId, item.productVariantId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + item.quantity })
          .where(eq(cartItems.id, existing[0].id));
      } else {
        await db.insert(cartItems).values({
          cartId: userCartId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        });
      }
    }

    // Delete guest cart
    await db.delete(carts).where(eq(carts.id, guestCartId));
  } catch (e) {
    console.error("[cart] mergeGuestCart error:", e);
  }
}
