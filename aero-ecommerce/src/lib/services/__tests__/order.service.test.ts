import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock dependencies ────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/repositories/order.repository", () => ({
  OrderRepository: {
    findByTransactionId: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    createWithItems: vi.fn(),
    updateStatus: vi.fn(),
    listAll: vi.fn(),
  },
}));
vi.mock("@/lib/repositories/coupon.repository", () => ({
  CouponRepository: { incrementUsage: vi.fn() },
}));
vi.mock("@/lib/repositories/stockReservation.repository", () => ({
  StockReservationRepository: { deleteBySessionId: vi.fn() },
}));
vi.mock("@/lib/repositories/auditLog.repository", () => ({
  AuditLogRepository: { create: vi.fn() },
}));
vi.mock("@/lib/jobs", () => ({
  enqueueJob: vi.fn(),
}));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn(actual.eq),
    sql: vi.fn(actual.sql),
  };
});

import { OrderService } from "../order.service";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { AuditLogRepository } from "@/lib/repositories/auditLog.repository";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "sess_test_123",
    amount_total: 4999,
    metadata: { cartId: "cart-1", userId: "user-1" },
    customer_details: { email: "test@example.com", name: "Test User", address: null },
    collected_information: null,
    ...overrides,
  } as unknown as import("stripe").Stripe.Checkout.Session;
}

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    userId: "user-1",
    guestEmail: null,
    status: "pending" as const,
    totalAmount: "49.99",
    couponCode: null,
    shippingAddressId: null,
    billingAddressId: null,
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── createFromStripeSession ──────────────────────────────────────────────────

describe("OrderService.createFromStripeSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns existing order ID on duplicate session (idempotency)", async () => {
    vi.mocked(OrderRepository.findByTransactionId).mockResolvedValue("existing-order-id");

    const result = await OrderService.createFromStripeSession(makeSession());

    expect(result.data).toBe("existing-order-id");
    expect(result.error).toBeNull();
    // Should NOT create a new order
    expect(OrderRepository.createWithItems).not.toHaveBeenCalled();
  });

  it("creates order for authenticated user", async () => {
    vi.mocked(OrderRepository.findByTransactionId).mockResolvedValue(null);
    vi.mocked(OrderRepository.createWithItems).mockResolvedValue(makeOrder());
    vi.mocked(AuditLogRepository.create).mockResolvedValue({
      id: "log-1",
      actorId: "user-1",
      action: "order.created",
      resourceType: "order",
      resourceId: "order-1",
      before: null,
      after: null,
      createdAt: new Date(),
    });

    // Mock db to return empty cart items (no cart in test)
    const dbModule = await import("@/lib/db");
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    });
    const mockDelete = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });
    Object.assign(dbModule.db as object, {
      select: mockSelect,
      delete: mockDelete,
      update: mockUpdate,
    });

    const result = await OrderService.createFromStripeSession(makeSession());

    expect(result.error).toBeNull();
    expect(result.data).toBe("order-1");
    expect(OrderRepository.createWithItems).toHaveBeenCalledOnce();
  });

  it("creates guest order with guestEmail when no userId in metadata", async () => {
    vi.mocked(OrderRepository.findByTransactionId).mockResolvedValue(null);
    vi.mocked(OrderRepository.createWithItems).mockResolvedValue(
      makeOrder({ userId: null, guestEmail: "guest@example.com" })
    );
    vi.mocked(AuditLogRepository.create).mockResolvedValue({
      id: "log-1",
      actorId: "guest",
      action: "order.created",
      resourceType: "order",
      resourceId: "order-1",
      before: null,
      after: null,
      createdAt: new Date(),
    });

    const dbModule = await import("@/lib/db");
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    });
    const mockDelete = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    Object.assign(dbModule.db as object, {
      select: mockSelect,
      delete: mockDelete,
    });

    const session = makeSession({
      metadata: { cartId: "cart-1" }, // no userId
      customer_details: { email: "guest@example.com", name: null, address: null },
    });

    const result = await OrderService.createFromStripeSession(session);

    expect(result.error).toBeNull();
    const callArgs = vi.mocked(OrderRepository.createWithItems).mock.calls[0][0];
    expect(callArgs.order.userId).toBeUndefined();
    expect(callArgs.order.guestEmail).toBe("guest@example.com");
  });
});

// ─── updateStatus ─────────────────────────────────────────────────────────────

describe("OrderService.updateStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ORDER_NOT_FOUND when order does not exist", async () => {
    vi.mocked(OrderRepository.findById).mockResolvedValue(null);
    const result = await OrderService.updateStatus("bad-id", "paid", "admin-1");
    expect(result.error).toBe("ORDER_NOT_FOUND");
  });

  it("rejects invalid transition pending → delivered", async () => {
    vi.mocked(OrderRepository.findById).mockResolvedValue(makeOrder({ status: "pending" }));
    const result = await OrderService.updateStatus("order-1", "delivered", "admin-1");
    expect(result.error).toMatch(/INVALID_TRANSITION/);
    expect(OrderRepository.updateStatus).not.toHaveBeenCalled();
  });

  it("rejects invalid transition delivered → cancelled", async () => {
    vi.mocked(OrderRepository.findById).mockResolvedValue(makeOrder({ status: "delivered" }));
    const result = await OrderService.updateStatus("order-1", "cancelled", "admin-1");
    expect(result.error).toMatch(/INVALID_TRANSITION/);
  });

  it("allows valid transition pending → paid", async () => {
    vi.mocked(OrderRepository.findById).mockResolvedValue(makeOrder({ status: "pending" }));
    vi.mocked(OrderRepository.updateStatus).mockResolvedValue(makeOrder({ status: "paid" }));
    vi.mocked(AuditLogRepository.create).mockResolvedValue({
      id: "log-1",
      actorId: "admin-1",
      action: "order.status_change",
      resourceType: "order",
      resourceId: "order-1",
      before: null,
      after: null,
      createdAt: new Date(),
    });

    const result = await OrderService.updateStatus("order-1", "paid", "admin-1");
    expect(result.error).toBeNull();
    expect(result.data?.status).toBe("paid");
    expect(AuditLogRepository.create).toHaveBeenCalledOnce();
  });

  it("allows valid transition paid → shipped", async () => {
    vi.mocked(OrderRepository.findById).mockResolvedValue(makeOrder({ status: "paid" }));
    vi.mocked(OrderRepository.updateStatus).mockResolvedValue(makeOrder({ status: "shipped" }));
    vi.mocked(AuditLogRepository.create).mockResolvedValue({
      id: "log-1",
      actorId: "admin-1",
      action: "order.status_change",
      resourceType: "order",
      resourceId: "order-1",
      before: null,
      after: null,
      createdAt: new Date(),
    });

    const result = await OrderService.updateStatus("order-1", "shipped", "admin-1");
    expect(result.error).toBeNull();
    expect(result.data?.status).toBe("shipped");
  });
});
