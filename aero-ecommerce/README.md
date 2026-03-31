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
| Icons | Lucide React | 1.7.x |

---

## Features

### Storefront
- Product catalog driven entirely from PostgreSQL — no mock data on the listing page
- Full-text search, filter by gender / color / size / category / price range, sort by price or newest
- Product detail page with image gallery, color swatches, size picker, and add-to-bag
- Persistent cart for both guests (cookie-based) and authenticated users (DB-backed)
- Guest cart merges into user cart on sign-in or sign-up
- Wishlist — save products, view at `/account/wishlist`
- Product reviews — one per user per product, star rating + comment

### Checkout
- Pre-checkout screen: choose Member login / sign-up or Guest Checkout
- Coupon code input with live discount calculation
- Stripe Hosted Checkout with shipping + billing address collection
- Webhook handler creates order, decrements inventory, fires confirmation email — all idempotent

### Account
- `/account/orders` — full order history with status badges
- `/account/orders/[id]` — itemised order detail, shipping address, payment ref
- `/account/wishlist` — saved products
- `/account/profile` — update name (email immutable)

### Admin Dashboard (`/admin`)
- Dashboard with live stats: total revenue, customers, orders, avg order value
- Recent orders table + top products by units sold
- `/admin/products` — toggle published/draft per product
- `/admin/orders` — update order status via dropdown
- `/admin/inventory` — inline edit stock levels per variant
- Role-based access: `role = "admin"` on the user row, checked at layout + action level

### Auth
- Email/password via Better Auth
- Google OAuth (optional — configure with `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)
- Server-side redirect after sign-in — cookies and redirect in the same HTTP response, no race condition
- Rate limiting on auth endpoints: 10 attempts per IP per minute (in-memory sliding window)

### Observability
- All server actions return `{ data } | { error }` — no silent null failures
- Stripe webhook errors logged with event type, session ID, and message
- Transactional order confirmation email via Resend (fire-and-forget, non-blocking)

---

## Project Structure

```
aero-ecommerce/
├── public/
│   ├── IMG_7194.PNG          # Aero logo
│   ├── hero-bg.png
│   ├── hero-shoe.png
│   └── shoes/                # 15 product images
│
├── src/
│   ├── app/
│   │   ├── (auth)/           # Sign-in, Sign-up (centered card layout)
│   │   ├── (root)/           # Main storefront
│   │   │   ├── page.tsx      # Home
│   │   │   ├── products/     # Listing + detail
│   │   │   ├── cart/
│   │   │   ├── checkout/     # Options screen + form + success
│   │   │   ├── account/      # Orders, wishlist, profile
│   │   │   └── contact/
│   │   ├── (admin)/          # Admin panel (role-gated)
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       └── inventory/
│   │   └── api/
│   │       ├── auth/[...all]/  # Better Auth handler (rate-limited)
│   │       └── stripe/         # Webhook
│   │
│   ├── components/
│   │   ├── admin/            # AdminSidebar, AdminOrderRow, AdminProductRow, AdminInventoryRow
│   │   └── ...               # Navbar, Footer, CartClient, CheckoutPageClient, etc.
│   │
│   ├── lib/
│   │   ├── auth.ts           # Better Auth config
│   │   ├── auth/actions.ts   # signIn, signUp, signInAndRedirect, signUpAndRedirect, signOut
│   │   ├── db/schema/        # One file per table, re-exported from index.ts
│   │   ├── actions/          # Server actions (cart, checkout, orders, products, wishlist, reviews, coupons, admin, account)
│   │   ├── email/            # Resend + OrderConfirmation React Email template
│   │   └── utils/            # query.ts (filter parsing), rateLimit.ts
│   │
│   ├── store/
│   │   └── cart.store.ts     # Zustand cart store (localStorage persisted)
│   └── db/
│       ├── seed2.ts          # Full DB seed
│       └── create-admin.ts   # Creates admin@aerostore.com account
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

# 3. Push schema to DB
npm run db:push

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
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema directly to DB |
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
| `products` / `product_variants` / `product_images` | Catalog |
| `categories` / `brands` / `genders` / `colors` / `sizes` | Reference data |
| `carts` / `cart_items` | Per-user and per-guest carts |
| `orders` / `order_items` / `payments` | Order lifecycle |
| `addresses` | Shipping/billing — created from Stripe data on webhook |
| `wishlists` | Saved products per user |
| `reviews` | One per user per product (unique constraint) |
| `coupons` | Discount codes with expiry and usage cap |

### Enums
`order_status`: pending · paid · shipped · delivered · cancelled  
`payment_method`: stripe · paypal · cod  
`payment_status`: initiated · completed · failed  
`address_type`: billing · shipping  
`discount_type`: percentage · fixed

---

## Auth Flow

```
Sign in (email/password)
  └── callAuthAPI("/sign-in/email")        # hits Better Auth HTTP API
        └── forwards Set-Cookie to browser
        └── merges guest cart if present
        └── checks role
        └── redirect() server-side         # cookies + redirect in same response
              ├── admin  → /admin/dashboard
              └── user   → redirectTo param (default: /)
```

The server-side `redirect()` is critical — it ensures the session cookie and the `307 Location` header are in the same HTTP response, so the browser has the cookie before it follows the redirect.

---

## Checkout Flow

```
Cart → /checkout/options
  ├── Logged in?  → skip to /checkout directly
  ├── Log In / Sign Up → /sign-in?redirect=/checkout
  └── Guest Checkout → /checkout

/checkout (CheckoutPageClient)
  ├── Delivery form + coupon code input
  ├── Order summary sidebar
  └── Save & Continue → createStripeCheckoutSession(couponCode)
        └── redirect to Stripe Hosted Checkout

Stripe webhook (checkout.session.completed)
  ├── Idempotency check (transactionId unique)
  ├── Create order + order_items
  ├── Decrement product_variants.inStock
  ├── Clear cart
  ├── Increment coupon.usedCount
  ├── Record payment
  └── Fire order confirmation email (Resend, non-blocking)
```

---

## Stripe Test Cards

| Card | Number |
|---|---|
| Success | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| 3D Secure | `4000 0025 0000 3155` |

Any future expiry, any CVC, any postal code.
