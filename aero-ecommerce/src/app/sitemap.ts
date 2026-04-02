import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { and, eq, isNull } from "drizzle-orm";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  if (!db) return staticRoutes;

  try {
    const publishedProducts = await db
      .select({ id: products.id, updatedAt: products.updatedAt })
      .from(products)
      .where(and(eq(products.isPublished, true), isNull(products.deletedAt)));

    const productRoutes: MetadataRoute.Sitemap = publishedProducts.map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
