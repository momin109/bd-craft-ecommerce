import { apiClient, unwrap } from "@/lib/api/client";
import { ApiProduct } from "@/types/api/product";

export const wishlistService = {
  getAll: async () => {
    const res = await apiClient.get("/wishlist");
    return unwrap<ApiProduct[]>(res);
  },

  add: async (productId: string) => {
    const res = await apiClient.post(`/wishlist/${productId}`);
    return unwrap<{ message: string }>(res);
  },

  remove: async (productId: string) => {
    const res = await apiClient.delete(`/wishlist/${productId}`);
    return unwrap<{ message: string }>(res);
  },

  check: async (productId: string) => {
    const res = await apiClient.get(`/wishlist/${productId}/check`);
    return unwrap<{ wishlisted: boolean }>(res);
  },
};
