"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema/reviews";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const submitReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<{ data: { id: string } } | { error: string }> {
  const parsed = submitReviewSchema.safeParse({ productId, rating, comment });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let userId: string;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { error: "You must be signed in to leave a review." };
    userId = session.user.id;
  } catch {
    return { error: "Authentication error." };
  }

  if (!db) return { error: "Service unavailable." };

  try {
    // Check for existing review (unique constraint guard)
    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    if (existing.length > 0) return { error: "You have already reviewed this product." };

    const [inserted] = await db
      .insert(reviews)
      .values({ productId, userId, rating, comment: comment || null })
      .returning({ id: reviews.id });

    revalidatePath(`/products/${productId}`);
    return { data: { id: inserted.id } };
  } catch (e) {
    console.error("[reviews] submitReview error:", e);
    return { error: "Failed to submit review." };
  }
}

export async function getUserReviewForProduct(
  productId: string
): Promise<{ id: string; rating: number; comment: string | null } | null> {
  let userId: string;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    userId = session.user.id;
  } catch {
    return null;
  }

  if (!db) return null;

  try {
    const rows = await db
      .select({ id: reviews.id, rating: reviews.rating, comment: reviews.comment })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)))
      .limit(1);

    return rows[0] ?? null;
  } catch {
    return null;
  }
}
