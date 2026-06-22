import { apiClient, unwrap } from "@/lib/api/client";
import { ApiOrder, CheckoutPayload, UpdateOrderStatusPayload, AdminOrderQuery } from "@/types/api/order";
import { PaginatedResponse } from "@/types/api/common";

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

  adminUpdateStatus: async (orderId: string, payload: UpdateOrderStatusPayload) => {
    const res = await apiClient.patch(`/orders/admin/${orderId}/status`, payload);
    return unwrap<ApiOrder>(res);
  },
};
