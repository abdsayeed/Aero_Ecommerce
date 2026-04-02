import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock dependencies ────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));
vi.mock("@/lib/repositories/coupon.repository", () => ({
  CouponRepository: {
    findByCode: vi.fn(),
  },
}));
vi.mock("@/lib/repositories/stockReservation.repository", () => ({
  StockReservationRepository: {
    createMany: vi.fn(),
    findExpired: vi.fn(),
    deleteExpired: vi.fn(),
  },
}));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn(actual.eq),
    sql: vi.fn(actual.sql),
  };
});

import { CheckoutService } from "../checkout.service";
import { CouponRepository } from "@/lib/repositories/coupon.repository";
import { stripe } from "@/lib/stripe/client";

// ─── validateCoupon ───────────────────────────────────────────────────────────

describe("CheckoutService.validateCoupon", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns COUPON_NOT_FOUND when coupon does not exist", async () => {
    vi.mocked(CouponRepository.findByCode).mockResolvedValue(null);
    const result = await CheckoutService.validateCoupon("FAKE", 5000);
    expect(result.error).toBe("COUPON_NOT_FOUND");
    expect(result.data).toBeNull();
  });

  it("returns COUPON_EXPIRED when coupon is past expiresAt", async () => {
    vi.mocked(CouponRepository.findByCode).mockResolvedValue({
      id: "1",
      code: "OLD",
      discountType: "percentage",
      discountValue: "10",
      expiresAt: new Date("2000-01-01"),
      maxUsage: 100,
      usedCount: 0,
      deletedAt: null,
    });
    const result = await CheckoutService.validateCoupon("OLD", 5000);
    expect(result.error).toBe("COUPON_EXPIRED");
  });

  it("returns COUPON_EXHAUSTED when usedCount >= maxUsage", async () => {
    vi.mocked(CouponRepository.findByCode).mockResolvedValue({
      id: "1",
      code: "USED",
      discountType: "percentage",
      discountValue: "10",
      expiresAt: new Date(Date.now() + 86400_000),
      maxUsage: 5,
      usedCount: 5,
      deletedAt: null,
    });
    const result = await CheckoutService.validateCoupon("USED", 5000);
    expect(result.error).toBe("COUPON_EXHAUSTED");
  });

  it("calculates percentage discount correctly", async () => {
    vi.mocked(CouponRepository.findByCode).mockResolvedValue({
      id: "1",
      code: "SAVE10",
      discountType: "percentage",
      discountValue: "10",
      expiresAt: new Date(Date.now() + 86400_000),
      maxUsage: 100,
      usedCount: 0,
      deletedAt: null,
    });
    // 10% off $100 = $90 = 9000 cents
    const result = await CheckoutService.validateCoupon("SAVE10", 10000);
    expect(result.error).toBeNull();
    expect(result.data?.discountedTotal).toBe(9000);
  });

  it("calculates fixed discount correctly", async () => {
    vi.mocked(CouponRepository.findByCode).mockResolvedValue({
      id: "1",
      code: "FLAT5",
      discountType: "fixed",
      discountValue: "5.00",
      expiresAt: new Date(Date.now() + 86400_000),
      maxUsage: 100,
      usedCount: 0,
      deletedAt: null,
    });
    // $5 off $20 = $15 = 1500 cents
    const result = await CheckoutService.validateCoupon("FLAT5", 2000);
    expect(result.error).toBeNull();
    expect(result.data?.discountedTotal).toBe(1500);
  });

  it("never produces a total below $0.50 minimum (50 cents)", async () => {
    vi.mocked(CouponRepository.findByCode).mockResolvedValue({
      id: "1",
      code: "HUGE",
      discountType: "percentage",
      discountValue: "99",
      expiresAt: new Date(Date.now() + 86400_000),
      maxUsage: 100,
      usedCount: 0,
      deletedAt: null,
    });
    // 99% off $1 would be $0.01 — should be clamped to $0.50
    const result = await CheckoutService.validateCoupon("HUGE", 100);
    expect(result.error).toBeNull();
    expect(result.data?.discountedTotal).toBeGreaterThanOrEqual(50);
  });
});
