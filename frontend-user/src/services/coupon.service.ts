import { apiClient, unwrap } from "@/lib/api/client";
import { ApplyCouponPayload, ApplyCouponResult, ApiCoupon, CreateCouponPayload } from "@/types/api/coupon";

export const couponService = {
  apply: async (payload: ApplyCouponPayload) => {
    const res = await apiClient.post("/coupons/apply", payload);
    return unwrap<ApplyCouponResult>(res);
  },

  // Admin
  getAll: async () => {
    const res = await apiClient.get("/coupons/admin");
    return unwrap<ApiCoupon[]>(res);
  },

  create: async (payload: CreateCouponPayload) => {
    const res = await apiClient.post("/coupons/admin", payload);
    return unwrap<ApiCoupon>(res);
  },

  update: async (id: string, payload: Partial<CreateCouponPayload>) => {
    const res = await apiClient.patch(`/coupons/admin/${id}`, payload);
    return unwrap<ApiCoupon>(res);
  },

  remove: async (id: string) => {
    const res = await apiClient.delete(`/coupons/admin/${id}`);
    return unwrap<{ message: string }>(res);
  },
};
