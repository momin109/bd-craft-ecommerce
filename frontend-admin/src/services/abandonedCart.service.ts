import { apiClient, unwrap } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export type AbandonedCartLog = {
  id?: string;
  userId?: string;
  status: "SENT" | "FAILED" | "PENDING";
  createdAt?: string;
};

export type AbandonedCartRunResponse = {
  totalDetected: number;
  totalProcessed: number;
  logs: AbandonedCartLog[];
};

/* =========================
   SERVICE
========================= */

export const abandonedCartService = {
  // 🚀 Run manually
  runRecovery: async () => {
    const res = await apiClient.post("/abandoned-carts/run");
    return unwrap<AbandonedCartRunResponse>(res);
  },

  // 📊 Logs
  getLogs: async (status?: "SENT" | "FAILED" | "PENDING") => {
    const res = await apiClient.get("/abandoned-carts/logs", {
      params: status ? { status } : {},
    });

    return unwrap<AbandonedCartLog[]>(res);
  },
};
