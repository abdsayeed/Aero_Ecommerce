import { z } from "zod";

export const initiateCheckoutSchema = z.object({
  cartId: z.string().uuid(),
  couponCode: z.string().trim().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  cartTotal: z.number().positive(),
});

export type InitiateCheckoutInput = z.infer<typeof initiateCheckoutSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
