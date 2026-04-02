# Aero Store

> A production-grade full-stack e-commerce platform for Aero footwear. Built with Next.js 16 App Router, PostgreSQL (Neon), Drizzle ORM, Zustand, Tailwind CSS v4, Better Auth, and Stripe Checkout.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.1 |
| Language | TypeScript | 5.x |
| Database | PostgreSQL (Neon serverless) | — |
| ORM | Drizzle ORM | 0.45.x |
| Auth | Better Auth | 1.5.x |
| State | Zustand | 5.x |
| Styling | Tailwind CSS | v4 |
| Payments | Stripe Hosted Checkout | 21.x |
| Email | Resend + React Email | — |
| Validation | Zod | 4.x |
| Job Queue | BullMQ (Redis optional) | 5.x |
| Logging | Pino | 10.x |
| Error Tracking | Sentry | 10.x |
| Testing | Vitest + fast-check + Playwright | — |
| Icons | Lucide React | 1.7.x |

---

## Features

### Storefront
- Product catalog driven entirely from PostgreSQL — no mock data on the listing page
- Full-text search via PostgreSQL `tsvector` / `ts_rank`, filter by gender / color / size / category / price range, sort by price or newest
- Product detail page with image gallery, color swatches, size picker, and add-to-bag
- Persistent cart for both guests (cookie-based) and authenticated users (DB-backed)
- Guest cart merges into user cart on sign-in or sign-up
- Wishlist — save products, view at `/account/wishlist`
- Product reviews — one per user per product, star rating + comment
- SEO: `generateMetadata`, JSON-LD Product schema, `/sitemap.xml`, `/robots.txt`

### Checkout
- Pre-checkout screen: choose Member login / sign-up or Guest Checkout
- Coupon code input with live discount calculation (percentage or fixed, $0.50 minimum enforced)
- Stock reservation on checkout initiation — inventory held for 30 min, restored on session expiry
- Stripe Hosted Checkout with shipping + billing address collection
- Webhook handler creates order, decrements inventory, fires confirmation email — fully idempotent
- `checkout.session.expired` handler restores reserved stock automatically

### Account
- `/account/orders` — full order history with status badges
- `/account/orders/[id]` — itemised order detail, shipping address, payment ref
- `/account/wishlist` — saved products
- `/account/profile` — update name (email immutable)

### Admin Dashboard (`/admin`)
- Dashboard with live stats: total revenue, customers, orders, avg order value
- Recent orders table + top products by units sold
- `/admin/products` — toggle published/draft per product
- `/admin/orders` — update order status via dropdown (only valid transitions shown)
- `/admin/inventory` — inline edit stock levels; low-stock variants highlighted in amber/red
- `/admin/audit-logs` — full audit trail of all admin mutations
- Role-based access: `role = "admin"` on the user row, checked at layout + action level

### Auth
- Email/password via Better Auth
- Google OAuth (optional — configure with `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)
- Server-side redirect after sign-in — cookies and redirect in the same HTTP response, no race condition
- Rate limiting on auth endpoints: 10 attempts per IP per minute (in-memory sliding window)

### Observability & Reliability
- Structured logging via Pino — JSON in production, pretty-printed in dev
- Sentry error tracking — configure `SENTRY_DSN`; gracefully disabled if absent
- Background job queue via BullMQ — falls back to in-process execution when Redis is unavailable
- Recurring job: expired stock reservations cleaned up every 15 minutes
- All server actions and services return `ServiceResult<T>` — never throw, never silent null failures
- Audit log table records every admin mutation with before/after state

---

## Architecture

The codebase follows a layered architecture:

```
Server Actions  →  Service Layer  →  Repository Layer  →  Drizzle / DB
```

- **Repository layer** (`src/lib/repositories/`) is the sole consumer of Drizzle — no other file imports from `src/lib/db`
- **Service layer** (`src/lib/services/`) contains all business logic: idempotency, stock reservation, coupon validation, audit logging, notifications
- **Server actions** (`src/lib/actions/`) are thin — validate input with Zod, check rate limits, delegate to services
- **Validation schemas** (`src/lib/validations/`) derived from Drizzle table definitions via `drizzle-zod`

---

## Project Structure

```
aero-ecommerce/
├── e2e/                          # Playwright E2E tests
│   ├── checkout-guest.spec.ts
│   ├── checkout-auth.spec.ts
│   └── admin-rbac.spec.ts
│
├── public/
│   ├── IMG_7194.PNG              # Aero logo
│   ├── hero-bg.png / hero-shoe.png
│   └── shoes/                   # 15 product images
│
├── src/
│   ├── app/
│   │   ├── (auth)/              # Sign-in, Sign-up
│   │   ├── (root)/              # Main storefront
│   │   │   ├── page.tsx         # Home
│   │   │   ├── products/        # Listing + detail (with generateMetadata + JSON-LD)
│   │   │   ├── cart/
│   │   │   ├── checkout/        # Options + form + success
│   │   │   ├── account/         # Orders, wishlist, profile
│   │   │   └── contact/
│   │   ├── (admin)/             # Admin panel (role-gated)
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── inventory/
│   │   │       └── audit-logs/
│   │   ├── api/
│   │   │   ├── auth/[...all]/   # Better Auth handler
│   │   │   └── stripe/          # Webhook (completed + expired)
│   │   ├── sitemap.ts           # Dynamic sitemap
│   │   └── robots.ts            # Robots.txt
│   │
│   ├── components/
│   │   ├── admin/               # AdminSidebar, AdminOrderRow, AdminInventoryRow, etc.
│   │   └── ...                  # Navbar, Footer, CartClient, CheckoutPageClient, etc.
│   │
│   ├── lib/
│   │   ├── auth.ts              # Better Auth config
│   │   ├── auth/actions.ts      # signIn, signUp, signOut (rate-limited)
│   │   ├── logger.ts            # Pino structured logger
│   │   ├── cache/               # Redis cache helpers (null-safe)
│   │   ├── jobs/                # BullMQ queue, worker, scheduler
│   │   ├── stripe/              # Stripe client
│   │   ├── email/               # Resend + React Email templates
│   │   ├── db/schema/           # One file per table, re-exported from index.ts
│   │   ├── repositories/        # Data access layer (sole Drizzle consumers)
│   │   │   ├── order.repository.ts
│   │   │   ├── product.repository.ts
│   │   │   ├── coupon.repository.ts
│   │   │   ├── stockReservation.repository.ts
│   │   │   ├── wishlist.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── auditLog.repository.ts
│   │   ├── services/            # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── checkout.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── product.service.ts
│   │   │   └── notification.service.ts
│   │   ├── actions/             # Server actions (thin — validate + delegate)
│   │   ├── validations/         # Zod schemas (checkout, coupon, review, address, product)
│   │   └── utils/               # query.ts (filter parsing), rateLimit.ts
│   │
│   ├── store/
│   │   └── cart.store.ts        # Zustand cart store (localStorage persisted)
│   └── db/
│       ├── seed2.ts             # Full DB seed
│       └── create-admin.ts      # Creates admin@aerostore.com account
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Better Auth — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
# Redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (optional — skipped if blank)
RESEND_API_KEY=re_...

# Redis (optional — BullMQ job queue; falls back to in-process if absent)
REDIS_URL=redis://localhost:6379

# Sentry (optional — error tracking; disabled if absent)
SENTRY_DSN=https://...@sentry.io/...

# Log level (optional — default: "info")
LOG_LEVEL=info
```

> **Important:** `BETTER_AUTH_SECRET` must be a real random value. The session cookie is HMAC-signed with this secret — a placeholder will cause auth to fail silently. Restart the dev server after editing `.env.local`.

---

## Getting Started

```bash
# 1. Install dependencies
cd aero-ecommerce
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local — set DATABASE_URL and BETTER_AUTH_SECRET at minimum

# 3. Run database migrations
npm run db:migrate

# 4. Seed products
npm run db:seed

# 5. Create admin account
npx tsx src/db/create-admin.ts

# 6. Start dev server
npm run dev
```

App runs at `http://localhost:3000`.  
Admin dashboard at `http://localhost:3000/admin/dashboard`.

### Admin credentials (created by step 5)
```
Email:    admin@aerostore.com
Password: Admin@Aero2025
```

### Stripe webhook (local dev)
```bash
stripe listen --forward-to localhost:3000/api/stripe
# Copy the whsec_... secret into STRIPE_WEBHOOK_SECRET in .env.local
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run test` | Run unit + property tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema directly to DB (dev only) |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed all product data |
| `npm run db:studio` | Open Drizzle Studio |

---

## Database Schema

### Key tables

| Table | Purpose |
|---|---|
| `user` | Better Auth users — includes `role` column (`"user"` / `"admin"`) |
| `session` / `account` / `verification` | Better Auth internals |
| `guest` | Guest session tokens (7-day TTL) |
| `products` | Catalog — includes `searchVector` (tsvector), `deletedAt` (soft delete) |
| `product_variants` | SKU-level data — includes `lowStockThreshold`, `deletedAt` |
| `product_images` | Gallery images per product/variant |
| `categories` / `brands` / `genders` / `colors` / `sizes` | Reference data |
| `carts` / `cart_items` | Per-user and per-guest carts |
| `orders` / `order_items` / `payments` | Order lifecycle — `payments.transactionId` is unique (idempotency) |
| `stock_reservations` | Inventory held during Stripe checkout (30-min TTL) |
| `addresses` | Shipping/billing — created from Stripe data on webhook |
| `wishlists` | Saved products per user — unique `(userId, productId)` |
| `reviews` | One per user per product (unique constraint) |
| `coupons` | Discount codes with expiry, usage cap, and `deletedAt` (soft delete) |
| `audit_logs` | Immutable record of all admin mutations with before/after JSON |

### Enums
`order_status`: pending · paid · shipped · delivered · cancelled  
`payment_method`: stripe · paypal · cod  
`payment_status`: initiated · completed · failed  
`address_type`: billing · shipping  
`discount_type`: percentage · fixed

### Order status transitions
Only these transitions are valid (enforced in `OrderService` and the admin UI):

```
pending  →  paid | cancelled
paid     →  shipped | cancelled
shipped  →  delivered
```

---

## Auth Flow

```
Sign in (email/password)
  └── Rate limit check (10 req/min per IP)
  └── callAuthAPI("/sign-in/email")        # hits Better Auth HTTP API
        └── forwards Set-Cookie to browser
        └── merges guest cart if present
        └── checks role
        └── redirect() server-side         # cookies + redirect in same response
              ├── admin  → /admin/dashboard
              └── user   → redirectTo param (default: /)
```

---

## Checkout Flow

```
Cart → /checkout/options
  ├── Logged in?  → skip to /checkout directly
  ├── Log In / Sign Up → /sign-in?redirect=/checkout
  └── Guest Checkout → /checkout

/checkout (CheckoutPageClient)
  ├── Coupon validation → CheckoutService.validateCoupon
  │     ├── Checks: exists, not expired, not exhausted
  │     └── Enforces $0.50 minimum after discount
  └── Save & Continue → CheckoutService.initiateCheckout
        ├── Verifies stock for all cart items
        ├── Decrements inStock + inserts stock_reservations (30-min TTL)
        └── Creates Stripe Checkout Session → redirect

Stripe webhook (checkout.session.completed)
  ├── Idempotency check via payments.transactionId
  ├── Create order + order_items + payment record
  ├── Decrement product_variants.inStock
  ├── Increment coupon.usedCount
  ├── Delete stock_reservations for session
  ├── Clear cart
  ├── Insert audit_log entry
  └── Enqueue send-order-confirmation job

Stripe webhook (checkout.session.expired)
  ├── Find stock_reservations by session ID
  ├── Restore inStock for each reserved variant
  └── Delete reservation rows
```

---

## Testing

```bash
# Unit + property-based tests (no DB required)
npm run test

# E2E tests (requires dev server + seeded DB)
npm run test:e2e
```

### Test coverage
- **Unit tests** — `CheckoutService.validateCoupon` (6 cases), `OrderService.updateStatus` (5 cases), `OrderService.createFromStripeSession` (3 cases)
- **Property tests** — cache null-safety, rate limit enforcement, whitespace input rejection, order total round-trip, coupon minimum, status transition validity, sort order correctness
- **E2E tests** — guest checkout flow, authenticated checkout flow, admin RBAC redirect

---

## Stripe Test Cards

| Card | Number |
|---|---|
| Success | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| 3D Secure | `4000 0025 0000 3155` |

Any future expiry, any CVC, any postal code.
