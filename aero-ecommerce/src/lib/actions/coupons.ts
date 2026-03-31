"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema/coupons";

const couponCodeSchema = z.object({
  code: z.string().min(1).max(50).trim().toUpperCase(),
});

export type CouponResult =
  | { valid: true; discountType: "percentage" | "fixed"; discountValue: string; code: string }
  | { valid: false; error: string };

export async function validateCoupon(code: string): Promise<CouponResult> {
  const parsed = couponCodeSchema.safeParse({ code });
  if (!parsed.success) return { valid: false, error: "Invalid coupon code." };

  if (!db) return { valid: false, error: "Service unavailable." };

  try {
    const rows = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, parsed.data.code))
      .limit(1);

    if (!rows.length) return { valid: false, error: "Coupon not found." };

    const coupon = rows[0];

    if (new Date() > coupon.expiresAt) return { valid: false, error: "This coupon has expired." };
    if (coupon.usedCount >= coupon.maxUsage) return { valid: false, error: "This coupon has reached its usage limit." };

    return {
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      code: coupon.code,
    };
  } catch (e) {
    console.error("[coupons] validateCoupon error:", e);
    return { valid: false, error: "Something went wrong. Please try again." };
  }
}
