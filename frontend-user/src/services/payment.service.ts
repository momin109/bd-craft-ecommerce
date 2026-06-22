import { apiClient, unwrap } from "@/lib/api/client";

export interface InitiatePaymentResult {
  gateway: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  paymentUrl: string;
}

export const paymentService = {
  initiate: async (orderId: string) => {
    const res = await apiClient.post(`/payments/${orderId}/initiate`);
    return unwrap<InitiatePaymentResult>(res);
  },
};
