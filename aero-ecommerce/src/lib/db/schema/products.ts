import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  real,
  index,
  customType,
} from "drizzle-orm/pg-core";

// Custom tsvector type for full-text search
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { categories } from "./categories";
import { genders } from "./filters/genders";
import { brands } from "./brands";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    genderId: uuid("gender_id")
      .notNull()
      .references(() => genders.id),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    isPublished: boolean("is_published").notNull().default(false),
    defaultVariantId: uuid("default_variant_id"),
    searchVector: tsvector("search_vector"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_products_brand_published").on(t.brandId, t.isPublished),
    index("idx_products_category_published").on(t.categoryId, t.isPublished),
    index("idx_products_gender_published").on(t.genderId, t.isPublished),
    index("idx_products_created_at").on(t.createdAt),
    index("idx_products_search_vector").using("gin", t.searchVector),
  ]
);

// ─── Product Variants ─────────────────────────────────────────────────────────

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    colorId: uuid("color_id")
      .notNull()
      .references(() => colors.id),
    sizeId: uuid("size_id")
      .notNull()
      .references(() => sizes.id),
    inStock: integer("in_stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    weight: real("weight"),
    dimensions: jsonb("dimensions").$type<{
      length: number;
      width: number;
      height: number;
    }>(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_variants_color_product").on(t.colorId, t.productId),
    index("idx_variants_product").on(t.productId),
    index("idx_variants_size").on(t.sizeId),
  ]
);

// ─── Product Images ───────────────────────────────────────────────────────────

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  gender: one(genders, {
    fields: [products.genderId],
    references: [genders.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  defaultVariant: one(productVariants, {
    fields: [products.defaultVariantId],
    references: [productVariants.id],
    relationName: "default_variant",
  }),
  variants: many(productVariants),
  images: many(productImages),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    color: one(colors, {
      fields: [productVariants.colorId],
      references: [colors.id],
    }),
    size: one(sizes, {
      fields: [productVariants.sizeId],
      references: [sizes.id],
    }),
    images: many(productImages),
  })
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
}));

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertProductVariantSchema = createInsertSchema(productVariants);
export const selectProductVariantSchema = createSelectSchema(productVariants);

export const insertProductImageSchema = createInsertSchema(productImages);
export const selectProductImageSchema = createSelectSchema(productImages);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
