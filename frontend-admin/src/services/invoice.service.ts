import { apiClient, unwrap } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export type InvoiceStatus = "GENERATED" | "EMAILED" | "FAILED" | "PENDING";

export type Invoice = {
  id?: string;
  invoiceId: string;
  orderId: string;
  status: InvoiceStatus;
  downloadUrl?: string;
  createdAt?: string;
};

export type InvoiceListResponse = {
  invoices: Invoice[];
};

/* =========================
   SERVICE
========================= */

export const invoiceService = {
  // 🧾 Generate invoice (admin)
  generateInvoice: async (orderId: string, force?: boolean) => {
    const res = await apiClient.post(
      `/invoices/admin/orders/${orderId}/generate`,
      {},
      {
        params: force ? { force: true } : {},
      },
    );

    return unwrap<Invoice>(res);
  },

  // 📧 Email invoice (admin)
  emailInvoice: async (orderId: string, force?: boolean) => {
    const res = await apiClient.post(
      `/invoices/admin/orders/${orderId}/email`,
      {},
      {
        params: force ? { force: true } : {},
      },
    );

    return unwrap(res);
  },

  // 👤 Customer get own invoice
  getMyInvoice: async (orderId: string) => {
    const res = await apiClient.get(`/invoices/my-orders/${orderId}`);

    return unwrap<Invoice>(res);
  },

  // 📥 Download invoice (returns blob)
  downloadInvoice: async (invoiceId: string) => {
    const res = await apiClient.get(`/invoices/download/${invoiceId}`, {
      responseType: "blob",
    });

    return res.data;
  },

  // 📊 Admin invoice list
  getAdminInvoices: async (params?: {
    status?: InvoiceStatus;
    search?: string;
  }) => {
    const res = await apiClient.get(`/invoices/admin`, {
      params: params ?? {},
    });

    return unwrap<InvoiceListResponse>(res);
  },
};
