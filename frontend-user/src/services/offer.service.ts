import { apiClient, unwrap } from "@/lib/api/client";
import { ApiOffer } from "@/types/api/offer";

export const offerService = {
  getActiveOffers: async () => {
    const res = await apiClient.get("/offers/active");
    return unwrap<ApiOffer[]>(res);
  },
};
