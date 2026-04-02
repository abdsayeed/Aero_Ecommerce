import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { stockReservations } from "@/lib/db/schema/stockReservations";

export const StockReservationRepository = {
  async createMany(data: (typeof stockReservations.$inferInsert)[]) {
    if (!db || data.length === 0) return [];
    return db.insert(stockReservations).values(data).returning();
  },

  async findBySessionId(stripeSessionId: string) {
    if (!db) return [];
    return db
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.stripeSessionId, stripeSessionId));
  },

  async deleteBySessionId(stripeSessionId: string) {
    if (!db) return;
    await db
      .delete(stockReservations)
      .where(eq(stockReservations.stripeSessionId, stripeSessionId));
  },

  async findExpired() {
    if (!db) return [];
    return db
      .select()
      .from(stockReservations)
      .where(lt(stockReservations.expiresAt, new Date()));
  },

  async deleteExpired() {
    if (!db) return;
    await db
      .delete(stockReservations)
      .where(lt(stockReservations.expiresAt, new Date()));
  },
};
