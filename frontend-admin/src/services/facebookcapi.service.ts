import { apiClient, unwrap } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export type FacebookCapiContent = {
  id: string;
  quantity: number;
  item_price: number;
};

export type FacebookCapiTrackPayload = {
  eventName: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

  eventId: string;
  eventSourceUrl: string;

  value: number;
  currency: string;

  contentIds: string[];
  contentType: "product" | "product_group";

  contents: FacebookCapiContent[];
};

export type FacebookCapiLog = {
  id?: string;
  eventName?: string;
  eventId?: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  createdAt?: string;
  error?: string;
};

export type FacebookCapiLogResponse = {
  logs: FacebookCapiLog[];
};

/* =========================
   SERVICE
========================= */

export const facebookCapiService = {
  // 🚀 Track Event (ViewContent / AddToCart / Checkout / Purchase)
  trackEvent: async (payload: FacebookCapiTrackPayload) => {
    const res = await apiClient.post("/facebook-capi/track", payload);

    return unwrap(res);
  },

  // 📊 Get Logs
  getLogs: async (params?: {
    eventName?: string;
    status?: "SUCCESS" | "FAILED" | "PENDING";
  }) => {
    const res = await apiClient.get("/facebook-capi/logs", {
      params: params ?? {},
    });

    return unwrap<FacebookCapiLogResponse>(res);
  },
};
