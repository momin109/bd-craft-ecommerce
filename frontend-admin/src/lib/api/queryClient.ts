import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30 * 1000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  categories: { all: ["categories"] as const },
  products: {
    all: (params?: object) => ["products", params ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  orders: {
    admin: (params?: object) => ["orders", "admin", params ?? {}] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  customers: {
    all: (params?: object) => ["customers", params ?? {}] as const,
    detail: (id: string) => ["customers", id] as const,
    orders: (id: string, status?: string) => ["customers", id, "orders", status ?? "all"] as const,
  },
  coupons: { all: ["coupons"] as const },
  offers: { all: ["offers"] as const },
  reviews: { admin: (params?: object) => ["reviews", "admin", params ?? {}] as const },
  reports: {
    dashboard: ["reports", "dashboard"] as const,
    sales: (params?: object) => ["reports", "sales", params ?? {}] as const,
    products: ["reports", "products"] as const,
    customers: ["reports", "customers"] as const,
    couriers: (provider?: string) => ["reports", "couriers", provider ?? "all"] as const,
    returns: ["reports", "returns"] as const,
    profit: ["reports", "profit"] as const,
  },
  courier: { byOrder: (orderId: string) => ["courier", "order", orderId] as const },
  notifications: { logs: (params?: object) => ["notifications", "logs", params ?? {}] as const },
};
