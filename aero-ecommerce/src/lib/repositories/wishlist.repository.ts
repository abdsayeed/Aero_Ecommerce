import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema/wishlists";

export const WishlistRepository = {
  async findByUserId(userId: string) {
    if (!db) return [];
    return db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId));
  },

  async findByUserAndProduct(userId: string, productId: string) {
    if (!db) return null;
    const rows = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async toggle(userId: string, productId: string): Promise<"added" | "removed"> {
    if (!db) return "removed";
    const existing = await WishlistRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      await db
        .delete(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)));
      return "removed";
    }
    await db.insert(wishlists).values({ userId, productId });
    return "added";
  },
};
