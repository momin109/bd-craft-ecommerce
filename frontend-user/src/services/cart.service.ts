import { apiClient, unwrap } from "@/lib/api/client";
import { ApiCart, AddToCartPayload } from "@/types/api/cart";

export const cartService = {
  getCart: async () => {
    const res = await apiClient.get("/cart");
    return unwrap<ApiCart>(res);
  },

  addItem: async (payload: AddToCartPayload) => {
    const res = await apiClient.post("/cart/items", payload);
    return unwrap<ApiCart>(res);
  },

  updateItem: async (cartItemId: string, quantity: number) => {
    const res = await apiClient.patch(`/cart/items/${cartItemId}`, { quantity });
    return unwrap<ApiCart>(res);
  },

  removeItem: async (cartItemId: string) => {
    const res = await apiClient.delete(`/cart/items/${cartItemId}`);
    return unwrap<{ message: string }>(res);
  },

  clearCart: async () => {
    const res = await apiClient.delete("/cart/clear");
    return unwrap<{ message: string }>(res);
  },
};
