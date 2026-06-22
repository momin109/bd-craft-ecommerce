# Shopora Admin Panel

Separate Next.js app for managing the Shopora Bangladesh e-commerce backend.

## Setup

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm run dev
```

Runs on `http://localhost:3000` by default — change the port or deploy separately
from the customer storefront (e.g. `admin.shopora.com`).

## Architecture

Mirrors the customer app's pattern: `lib/api/client.ts` (Axios + interceptors),
`types/api/*` (backend contract types), `services/*` (pure API calls),
`hooks/queries/*` (React Query wrappers), `context/AuthContext.tsx` (session).

Key difference: **no refresh-token flow** — this backend issues a single
`accessToken` on login with no renewal endpoint, so a 401 simply clears the
session and redirects to `/login`. Login is also role-gated: only `ADMIN` /
`SUPER_ADMIN` accounts are allowed in, checked both at login and on every
session bootstrap (`/users/me`).

## Pages

| Route | Covers |
|---|---|
| `/dashboard` | Today/monthly stats, revenue chart, top products/customers |
| `/products`, `/products/new`, `/products/[id]/edit` | Variant-based product CRUD (SKU, size, color, price, stock per variant) |
| `/categories` | Category CRUD |
| `/orders`, `/orders/[id]` | Status filter/search, full status flow (Pending → Approved → Processing → Shipped → Delivered / Returned / Cancelled), courier booking + sync |
| `/customers`, `/customers/[id]` | Search/filter, COD allow/restrict, block/unblock, admin notes, order history |
| `/coupons` | Percentage/Fixed coupon CRUD |
| `/offers` | Flash Sale creation (full), Bundle (API-only for now — see note below) |
| `/reviews` | Pending/Approved/Hidden moderation |
| `/reports` | Sales (day/week/month), Products, Customers, Couriers, Returns, Profit + CSV export |
| `/notifications` | Send SMS/Email/WhatsApp, view logs with channel/status filters |

## Notes on backend contract assumptions

- **Order detail lookup**: the documented API doesn't list a single-order
  admin GET, but the status-update route's path (`PATCH /orders/admin/:orderId/status`)
  confirms `:orderId` is a valid resource path. `orderService.adminGetOne`
  tries `GET /orders/admin/:id` first and transparently falls back to
  scanning the admin list if that specific route 404s on your deployment —
  no code changes needed either way.
- **Product edit lookup**: reuses `GET /products/:slug`, passing the
  product's `_id` as the identifier (matching the customer app's pattern of
  accepting either). If your backend's slug route rejects raw ids, swap the
  lookup in `useProducts.ts`'s `useProduct` once verified against the live API.
