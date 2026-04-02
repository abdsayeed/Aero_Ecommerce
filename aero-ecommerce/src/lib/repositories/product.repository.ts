import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";

export const ProductRepository = {
  async search(query: string) {
    if (!db) return [];
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isPublished, true),
          isNull(products.deletedAt),
          sql`${products.searchVector} @@ plainto_tsquery('english', ${query})`
        )
      )
      .orderBy(
        desc(sql`ts_rank(${products.searchVector}, plainto_tsquery('english', ${query}))`)
      );
  },

  async findById(id: string) {
    if (!db) return null;
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .limit(1);
    return rows[0] ?? null;
  },

  async findAll() {
    if (!db) return [];
    return db
      .select()
      .from(products)
      .where(isNull(products.deletedAt))
      .orderBy(desc(products.createdAt));
  },

  async create(data: typeof products.$inferInsert) {
    if (!db) return null;
    const [row] = await db.insert(products).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<typeof products.$inferInsert>) {
    if (!db) return null;
    const [row] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
        searchVector: data.name || data.description
          ? sql`to_tsvector('english', coalesce(${data.name ?? sql`name`}, '') || ' ' || coalesce(${data.description ?? sql`description`}, ''))`
          : undefined,
      })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .returning();
    return row ?? null;
  },

  async softDelete(id: string) {
    if (!db) return null;
    const [row] = await db
      .update(products)
      .set({ deletedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return row ?? null;
  },

  async togglePublished(id: string, isPublished: boolean) {
    if (!db) return null;
    const [row] = await db
      .update(products)
      .set({ isPublished, updatedAt: new Date() })
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .returning();
    return row ?? null;
  },
};
