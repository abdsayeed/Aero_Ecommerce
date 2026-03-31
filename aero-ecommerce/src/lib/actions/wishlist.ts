"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema/wishlists";
import { products, productImages } from "@/lib/db/schema/products";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ProductListItem } from "./products";
import { categories } from "@/lib/db/schema/categories";
import { genders } from "@/lib/db/schema/filters/genders";
import { brands } from "@/lib/db/schema/brands";
import { productVariants } from "@/lib/db/schema/products";
import { sql, desc, asc } from "drizzle-orm";

const productIdSchema = z.object({ productId: z.string().uuid() });

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function toggleWishlist(
  productId: string
): Promise<{ data: { wishlisted: boolean } } | { error: string }> {
  const parsed = productIdSchema.safeParse({ productId });
  if (!parsed.success) return { error: "Invalid product ID." };

  const userId = await getCurrentUserId();
  if (!userId) return { error: "You must be signed in to save items." };
  if (!db) return { error: "Service unavailable." };

  try {
    const existing = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
      return { data: { wishlisted: false } };
    } else {
      await db.insert(wishlists).values({ userId, productId });
      return { data: { wishlisted: true } };
    }
  } catch (e) {
    console.error("[wishlist] toggleWishlist error:", e);
    return { error: "Something went wrong." };
  }
}

export async function getWishlist(): Promise<{ data: ProductListItem[] } | { error: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { data: [] };
  if (!db) return { data: [] };

  try {
    const wishlistRows = await db
      .select({ productId: wishlists.productId })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    if (!wishlistRows.length) return { data: [] };

    const productIds = wishlistRows.map((r) => r.productId);

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        isPublished: products.isPublished,
        createdAt: products.createdAt,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        genderId: products.genderId,
        genderLabel: genders.label,
        genderSlug: genders.slug,
        brandId: products.brandId,
        brandName: brands.name,
        brandSlug: brands.slug,
        minPrice: sql<string>`min(${productVariants.price}::numeric)::text`,
        maxPrice: sql<string>`max(${productVariants.price}::numeric)::text`,
        hasSale: sql<boolean>`bool_or(${productVariants.salePrice} is not null)`,
        colorCount: sql<number>`count(distinct ${productVariants.colorId})::int`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(genders, eq(products.genderId, genders.id))
      .innerJoin(brands, eq(products.brandId, brands.id))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(inArray(products.id, productIds))
      .groupBy(products.id, categories.id, genders.id, brands.id)
      .orderBy(desc(products.createdAt));

    const imageRows = await db
      .select({ productId: productImages.productId, url: productImages.url })
      .from(productImages)
      .where(and(inArray(productImages.productId, productIds), eq(productImages.isPrimary, true)));

    const imageMap = new Map(imageRows.map((i) => [i.productId, i.url]));

    const data: ProductListItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isPublished: r.isPublished,
      createdAt: r.createdAt,
      minPrice: r.minPrice ?? "0",
      maxPrice: r.maxPrice ?? "0",
      hasSale: r.hasSale ?? false,
      colorCount: r.colorCount ?? 0,
      category: { id: r.categoryId, name: r.categoryName, slug: r.categorySlug },
      gender: { id: r.genderId, label: r.genderLabel, slug: r.genderSlug },
      brand: { id: r.brandId, name: r.brandName, slug: r.brandSlug },
      primaryImage: imageMap.get(r.id) ?? null,
    }));

    return { data };
  } catch (e) {
    console.error("[wishlist] getWishlist error:", e);
    return { error: "Failed to load wishlist." };
  }
}

export async function getWishlistedProductIds(): Promise<string[]> {
  const userId = await getCurrentUserId();
  if (!userId || !db) return [];
  try {
    const rows = await db
      .select({ productId: wishlists.productId })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));
    return rows.map((r) => r.productId);
  } catch {
    return [];
  }
}
