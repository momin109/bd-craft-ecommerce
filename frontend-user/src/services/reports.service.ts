import { apiClient, unwrap } from "@/lib/api/client";
import {
  DashboardReport, SalesReportQuery, SalesReportRow, ProductReportRow,
  CustomerReportRow, CourierReportRow, ProfitReport,
} from "@/types/api/reports";

export const reportsService = {
  getDashboard: async () => {
    const res = await apiClient.get("/reports/dashboard");
    return unwrap<DashboardReport>(res);
  },

  getSales: async (params: SalesReportQuery = {}) => {
    const res = await apiClient.get("/reports/sales", { params });
    return unwrap<SalesReportRow[]>(res);
  },

  getProducts: async () => {
    const res = await apiClient.get("/reports/products");
    return unwrap<ProductReportRow[]>(res);
  },

  getCustomers: async () => {
    const res = await apiClient.get("/reports/customers");
    return unwrap<CustomerReportRow[]>(res);
  },

  getCouriers: async (provider?: string) => {
    const res = await apiClient.get("/reports/couriers", { params: provider ? { provider } : {} });
    return unwrap<CourierReportRow[]>(res);
  },

  getReturns: async () => {
    const res = await apiClient.get("/reports/returns");
    return unwrap<any[]>(res);
  },

  getProfit: async () => {
    const res = await apiClient.get("/reports/profit");
    return unwrap<ProfitReport>(res);
  },

  // CSV exports — these return a file download; build the URL for an <a> tag
  exportUrl: (type: "sales" | "products" | "customers" | "couriers" | "profit") => {
    return `${apiClient.defaults.baseURL}/reports/export/${type}`;
  },
};
