import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { coupons } from "@/lib/db/schema/coupons";

export const insertCouponValidationSchema = createInsertSchema(coupons, {
  code: z.string().trim().min(1, "Code is required"),
  discountValue: z.string().trim().min(1, "Discount value is required"),
});

export const selectCouponValidationSchema = createSelectSchema(coupons);

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
