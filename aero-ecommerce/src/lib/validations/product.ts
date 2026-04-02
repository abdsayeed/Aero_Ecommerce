import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products, productVariants } from "@/lib/db/schema/products";

export const insertProductValidationSchema = createInsertSchema(products, {
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
});

export const selectProductValidationSchema = createSelectSchema(products);

export const insertProductVariantValidationSchema = createInsertSchema(
  productVariants,
  {
    sku: z.string().trim().min(1, "SKU is required"),
    price: z.string().trim().min(1, "Price is required"),
  }
);

export const productSearchSchema = z.object({
  query: z.string().trim().min(1, "Search query is required"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ProductSearchInput = z.infer<typeof productSearchSchema>;
