import { apiClient, unwrap } from "@/lib/api/client";
import { ApiOffer, CartOfferPreview, CreateOfferPayload } from "@/types/api/offer";

export const offerService = {
  getActive: async () => {
    const res = await apiClient.get("/offers/active");
    return unwrap<ApiOffer[]>(res);
  },

  cartPreview: async () => {
    const res = await apiClient.get("/offers/cart-preview");
    return unwrap<CartOfferPreview>(res);
  },

  // Admin
  getAll: async () => {
    const res = await apiClient.get("/offers/admin");
    return unwrap<ApiOffer[]>(res);
  },

  create: async (payload: CreateOfferPayload) => {
    const res = await apiClient.post("/offers/admin", payload);
    return unwrap<ApiOffer>(res);
  },

  update: async (id: string, payload: Partial<CreateOfferPayload>) => {
    const res = await apiClient.patch(`/offers/admin/${id}`, payload);
    return unwrap<ApiOffer>(res);
  },

  remove: async (id: string) => {
    const res = await apiClient.delete(`/offers/admin/${id}`);
    return unwrap<{ message: string }>(res);
  },
};
