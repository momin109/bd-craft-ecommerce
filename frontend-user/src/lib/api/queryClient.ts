import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  categories: {
    all: ["categories"] as const,
    detail: (slug: string) => ["categories", slug] as const,
  },
  products: {
    all: (params?: object) => ["products", params ?? {}] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    search: (keyword: string) => ["products", "search", keyword] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
    check: (productId: string) => ["wishlist", "check", productId] as const,
  },
  orders: {
    my: ["orders", "my"] as const,
    track: (orderNumber: string, mobile: string) => ["orders", "track", orderNumber, mobile] as const,
    adminAll: (params?: object) => ["orders", "admin", params ?? {}] as const,
  },
  coupons: {
    all: ["coupons"] as const,
    adminAll: ["coupons", "admin"] as const,
  },
  offers: {
    active: ["offers", "active"] as const,
    cartPreview: ["offers", "cart-preview"] as const,
    adminAll: ["offers", "admin"] as const,
  },
  reviews: {
    byProduct: (productId: string) => ["reviews", "product", productId] as const,
    my: ["reviews", "my"] as const,
    admin: (params?: object) => ["reviews", "admin", params ?? {}] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
  reports: {
    dashboard: ["reports", "dashboard"] as const,
    sales: (params?: object) => ["reports", "sales", params ?? {}] as const,
    products: ["reports", "products"] as const,
    customers: ["reports", "customers"] as const,
    couriers: (provider?: string) => ["reports", "couriers", provider ?? "all"] as const,
    returns: ["reports", "returns"] as const,
    profit: ["reports", "profit"] as const,
  },
  adminCustomers: {
    all: (params?: object) => ["admin-customers", params ?? {}] as const,
    detail: (id: string) => ["admin-customers", id] as const,
    orders: (id: string, status?: string) => ["admin-customers", id, "orders", status ?? "all"] as const,
  },
  courier: {
    byOrder: (orderId: string) => ["courier", "order", orderId] as const,
  },
  notifications: {
    logs: (params?: object) => ["notifications", "logs", params ?? {}] as const,
  },
};
