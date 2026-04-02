import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productVariants } from "./products";

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeSessionId: text("stripe_session_id").notNull(),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_stock_reservations_expires_at").on(t.expiresAt),
    index("idx_stock_reservations_session_id").on(t.stripeSessionId),
  ]
);

export const stockReservationsRelations = relations(stockReservations, ({ one }) => ({
  variant: one(productVariants, {
    fields: [stockReservations.productVariantId],
    references: [productVariants.id],
  }),
}));

export type StockReservation = typeof stockReservations.$inferSelect;
export type NewStockReservation = typeof stockReservations.$inferInsert;
