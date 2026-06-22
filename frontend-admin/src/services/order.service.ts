import { apiClient, unwrap } from "@/lib/api/client";
import { ApiOrder, CheckoutPayload, UpdateOrderStatusPayload, AdminOrderQuery, getOrderId } from "@/types/api/order";
import { PaginatedResponse } from "@/types/api/common";

function normalizeOrders(raw: PaginatedResponse<ApiOrder> | ApiOrder[]): ApiOrder[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as any).items)) return (raw as any).items;
  return [];
}

export const orderService = {
  checkout: async (payload: CheckoutPayload) => {
    const res = await apiClient.post("/orders/checkout", payload);
    return unwrap<ApiOrder>(res);
  },

  getMyOrders: async () => {
    const res = await apiClient.get("/orders/my-orders");
    return unwrap<ApiOrder[]>(res);
  },

  trackOrder: async (orderNumber: string, mobile: string) => {
    const res = await apiClient.get(`/orders/track/${orderNumber}`, { params: { mobile } });
    return unwrap<ApiOrder>(res);
  },

  // Admin
  adminGetAll: async (params: AdminOrderQuery = {}) => {
    const res = await apiClient.get("/orders/admin", { params });
    return unwrap<PaginatedResponse<ApiOrder> | ApiOrder[]>(res);
  },

  // The documented contract doesn't list a single-order admin GET, but the
  // status-update route (PATCH /orders/admin/:orderId/status) confirms the
  // resource path is valid — so we try the natural GET first and fall back
  // to scanning the admin list if this deployment doesn't expose it (404).
  adminGetOne: async (orderId: string): Promise<ApiOrder | null> => {
    try {
      const res = await apiClient.get(`/orders/admin/${orderId}`);
      return unwrap<ApiOrder>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const all = await orderService.adminGetAll({});
        const list = normalizeOrders(all);
        return list.find((o) => getOrderId(o) === orderId) ?? null;
      }
      throw err;
    }
  },

  adminUpdateStatus: async (orderId: string, payload: UpdateOrderStatusPayload) => {
    const res = await apiClient.patch(`/orders/admin/${orderId}/status`, payload);
    return unwrap<ApiOrder>(res);
  },
};
