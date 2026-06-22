# API Integration Guide — Shopora Frontend

## Architecture Overview

```
src/
├── lib/api/
│   ├── client.ts          # Axios instance + interceptors + refresh-token flow
│   └── queryClient.ts     # React Query client + centralized query keys
├── types/api/              # TypeScript interfaces matching backend contracts
│   ├── auth.ts, product.ts, category.ts, cart.ts,
│   ├── order.ts, review.ts, coupon.ts, offer.ts, common.ts
├── services/                # Pure API functions (one file per backend module)
│   ├── auth.service.ts, product.service.ts, cart.service.ts, ...
├── hooks/queries/            # React Query hooks wrapping each service
│   ├── useAuth.ts, useProducts.ts, useCart.ts, ...
├── context/
│   └── AuthContext.tsx      # Session state, token bootstrap, logout
└── components/auth/
    └── ProtectedRoute.tsx    # Route guard wrapper
```

## Environment Setup

Set the backend base URL in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

## Auth Flow

1. **Register / Login / OTP verify** → backend returns `{ accessToken, refreshToken, user }`
2. `AuthContext.setSession()` stores tokens in cookies (via `tokenStorage`) and sets `user` in memory
3. On every app load, `AuthContext` calls `GET /users/me` using the stored access token to restore the session
4. Axios interceptor attaches `Authorization: Bearer <accessToken>` to every request
5. On `401`, the interceptor automatically calls `POST /auth/refresh-token` and retries the original request once. Concurrent requests during a refresh are queued and resolved together.
6. If refresh fails, tokens are cleared and the user is redirected to `/login`.

## Protected Routes

Wrap any page that requires authentication:

```tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <AccountContent />
    </ProtectedRoute>
  );
}
```

## Adding a New Endpoint

1. Add/extend the TypeScript type in `src/types/api/`
2. Add the function to the relevant file in `src/services/`
3. Add a `useQuery`/`useMutation` hook in `src/hooks/queries/`
4. Add the query key to `queryKeys` in `src/lib/api/queryClient.ts`
5. Consume the hook in your page/component

This keeps the data layer fully decoupled from UI — backend contract changes only touch `services/` and `types/api/`.

## Loading / Error / Empty States

Reusable components live in `src/components/shared/`:
- `LoadingState`, `LoadingGrid` — spinners and skeleton grids
- `ErrorState` — retry-capable error block
- `EmptyState` — generic "nothing here yet" block

## Known Gaps / TODO (flagged during integration)

- Admin dashboards (orders, coupons, offers, reviews moderation) are **not yet built** — only customer-facing flows were wired per this task's scope. Service/hook layers already exist for these (`adminGetAll`, `adminApprove`, etc.) so building admin UI is a matter of new pages, not new plumbing.
- `useUpdateOrderStatus` / `useAdminOrders` hooks exist but have no consuming page yet.
- Courier booking/sync hooks are not yet wired into any UI (no admin shipment screen exists in this iteration).
- Product filter facets (available colors/sizes per category) are currently hardcoded in `CategoryPage` — recommend a `/products/facets` endpoint if precise filtering is needed.
- Notification logs endpoint has a service function but no UI consumer.
