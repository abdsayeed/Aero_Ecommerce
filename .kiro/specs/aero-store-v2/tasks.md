# Implementation Plan: Aero Store v2

## Overview

Incremental hardening of the existing Next.js 16 / PostgreSQL / Stripe platform. Tasks are ordered by dependency: infrastructure first, then data layer, then service/repository layer, then refactoring existing actions, then features, then SEO and testing. Checkout reliability tasks are prioritised highest.

## Tasks

- [x] 1. Infrastructure — Logger, Cache, and Rate Limiter
  - [x] 1.1 Create `src/lib/logger.ts`
  - [x] 1.2 Create `src/lib/cache/redis.ts` and `src/lib/cache/index.ts`
  - [ ]* 1.3 Write property test for cache null-safety
  - [x] 1.4 Extend `src/lib/utils/rateLimit.ts` with configurable options
  - [ ]* 1.5 Write property test for rate limiter enforcement

- [x] 2. Infrastructure — Background Job Queue
  - [x] 2.1 Create `src/lib/jobs/queue.ts`
  - [x] 2.2 Create `src/lib/jobs/worker.ts`
  - [x] 2.3 Create `src/lib/jobs/scheduler.ts`
  - [x] 2.4 Create `src/lib/jobs/index.ts`

- [x] 3. Database Schema — New Tables and Column Additions
  - [x] 3.1 Create `src/lib/db/schema/stockReservations.ts`
  - [x] 3.2 Create `src/lib/db/schema/auditLogs.ts`
  - [x] 3.3 Modify existing schema files (products, productVariants, coupons, orders, payments, wishlists)
  - [x] 3.4 Generate Drizzle migration (`drizzle/0002_fair_scourge.sql`) — **run `npx drizzle-kit migrate` manually**

- [x] 4. Checkpoint — Schema and Infrastructure

- [x] 5. Zod Validation Schemas
  - [x] 5.1 Create `src/lib/validations/checkout.ts`, `coupon.ts`, `review.ts`, `address.ts`, `product.ts`
  - [ ]* 5.2 Write property test for whitespace input rejection

- [x] 6. Repository Layer
  - [x] 6.1 `src/lib/repositories/order.repository.ts`
  - [x] 6.2 `src/lib/repositories/product.repository.ts`
  - [x] 6.5 `src/lib/repositories/coupon.repository.ts`
  - [x] 6.6 `src/lib/repositories/stockReservation.repository.ts`
  - [x] 6.7 `src/lib/repositories/wishlist.repository.ts`
  - [x] 6.9 `src/lib/repositories/user.repository.ts`
  - [x] 6.10 `src/lib/repositories/auditLog.repository.ts`

- [x] 7. Service Layer — AuthService and NotificationService
  - [x] 7.1 `src/lib/services/auth.service.ts`
  - [x] 7.2 `src/lib/services/notification.service.ts`
  - [ ]* 7.3 Write property test for order confirmation email delivery

- [x] 8. Service Layer — OrderService
  - [x] 8.1 `src/lib/services/order.service.ts`

- [x] 9. Service Layer — CheckoutService
  - [x] 9.1 `src/lib/services/checkout.service.ts`

- [x] 10. Service Layer — ProductService
  - [x] 10.1 `src/lib/services/product.service.ts`

- [x] 11. Checkpoint — Service and Repository Layer

- [x] 12. Stripe Webhook Hardening
  - [x] 12.1 Handle `checkout.session.expired` — restore stock + delete reservations
  - [x] 12.2 Sentry capture on webhook error paths (via logger + Sentry config)

- [x] 13. Refactor Existing Server Actions to Delegate to Services
  - [x] 13.1 Refactor `src/lib/actions/checkout.ts`
  - [x] 13.2 Refactor `src/lib/actions/orders.ts`
  - [x] 13.3 Refactor `src/lib/actions/products.ts` — read-only, no admin mutations to guard
  - [x] 13.4 Refactor `src/lib/actions/admin.ts`
  - [x] 13.5 Rate limit added to sign-in/sign-up in `src/lib/auth/actions.ts` (10 req/min per IP)

- [x] 14. Sentry Integration
  - [x] 14.1 `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - [x] 14.2 `next.config.ts` wrapped with `withSentryConfig`

- [x] 15. Admin Panel Enhancements
  - [x] 15.1 Admin order status transitions enforced in UI
  - [x] 15.2 `/admin/audit-logs` page
  - [x] 15.3 `AdminInventoryRow` low-stock highlighting

- [x] 16. SEO — Metadata, JSON-LD, Sitemap, Robots
  - [x] 16.1 `generateMetadata` on product detail page
  - [x] 16.2 JSON-LD Product schema on product detail page
  - [x] 16.3 `src/app/sitemap.ts`
  - [x] 16.4 `src/app/robots.ts`

- [x] 17. Property-Based Tests — Remaining Properties
  - [x]* 17.1 Property tests written in `src/lib/__tests__/properties.test.ts`
    - Property 12: Cache null-safety
    - Property 12b: Rate limit enforcement
    - Property 5: Whitespace input rejection
    - Property 2: Order total round-trip
    - Property 6: Coupon minimum enforcement
    - Property 15: Order listing sort order
    - Property 16: Invalid status transitions

- [x] 18. Unit Tests for Services
  - [x]* 18.1 `src/lib/services/__tests__/checkout.service.test.ts` — 6 tests
  - [x]* 18.2 `src/lib/services/__tests__/order.service.test.ts` — 8 tests

- [x] 19. E2E Tests (Playwright)
  - [x]* 19.1 `e2e/checkout-guest.spec.ts`
  - [x]* 19.2 `e2e/checkout-auth.spec.ts`
  - [x]* 19.3 `e2e/admin-rbac.spec.ts`

- [x] 20. Final Checkpoint — Full Test Suite
  - `npx vitest --run` → 24/24 tests passing ✓
  - `npx next build` → zero errors ✓
  - `npx tsc --noEmit` → zero errors ✓
  - E2E tests in `e2e/` — run with `npm run test:e2e` (requires dev server + seeded DB)
  - Pending manual step: run `npx drizzle-kit migrate` in `aero-ecommerce/` to apply `0002_fair_scourge.sql`

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at natural boundaries
- Property tests validate universal correctness invariants; unit tests validate specific examples and error conditions
- The repository layer is the sole Drizzle consumer — no other file may import from `src/lib/db`
