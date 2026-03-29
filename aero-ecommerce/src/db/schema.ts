import {
    pgTable,
    serial,
    text,
    numeric,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    brand: text("brand").notNull().default("Nike"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    image: text("image").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
