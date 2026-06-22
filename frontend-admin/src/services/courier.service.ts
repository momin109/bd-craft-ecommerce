import { apiClient, unwrap } from "@/lib/api/client";
import { ApiShipment, BookCourierPayload } from "@/types/api/courier";

export const courierService = {
  bookCourier: async (orderId: string, payload: BookCourierPayload) => {
    const res = await apiClient.post(`/couriers/orders/${orderId}/book`, payload);
    return unwrap<ApiShipment>(res);
  },

  getByOrder: async (orderId: string) => {
    const res = await apiClient.get(`/couriers/orders/${orderId}`);
    return unwrap<ApiShipment>(res);
  },

  syncStatus: async (shipmentId: string) => {
    const res = await apiClient.post(`/couriers/shipments/${shipmentId}/sync`);
    return unwrap<ApiShipment>(res);
  },
};
