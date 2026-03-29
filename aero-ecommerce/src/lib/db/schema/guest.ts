import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("sessionToken").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type Guest = typeof guest.$inferSelect;
export type NewGuest = typeof guest.$inferInsert;
