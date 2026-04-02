import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema/coupons";

export const CouponRepository = {
  async findByCode(code: string) {
    if (!db) return null;
    const rows = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code), isNull(coupons.deletedAt)))
      .limit(1);
    return rows[0] ?? null;
  },

  async incrementUsage(code: string) {
    if (!db) return null;
    const [row] = await db
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1` })
      .where(eq(coupons.code, code))
      .returning();
    return row ?? null;
  },

  async softDelete(id: string) {
    if (!db) return null;
    const [row] = await db
      .update(coupons)
      .set({ deletedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return row ?? null;
  },
};
