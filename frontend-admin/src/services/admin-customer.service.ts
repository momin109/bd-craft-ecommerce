import { apiClient, unwrap } from "@/lib/api/client";
import {
  AdminCustomerListItem, AdminCustomerQuery, AdminCustomerDetail,
  SetCodPayload, SetCustomerStatusPayload, AddCustomerNotePayload,
} from "@/types/api/admin-customer";
import { ApiOrder, OrderStatus } from "@/types/api/order";

export const adminCustomerService = {
  getAll: async (params: AdminCustomerQuery = {}) => {
    const res = await apiClient.get("/users/admin/customers", { params });
    return unwrap<AdminCustomerListItem[]>(res);
  },

  getDetail: async (customerId: string) => {
    const res = await apiClient.get(`/users/admin/customers/${customerId}`);
    return unwrap<AdminCustomerDetail>(res);
  },

  getOrders: async (customerId: string, status?: OrderStatus) => {
    const res = await apiClient.get(`/users/admin/customers/${customerId}/orders`, { params: status ? { status } : {} });
    return unwrap<ApiOrder[]>(res);
  },

  setCod: async (customerId: string, payload: SetCodPayload) => {
    const res = await apiClient.patch(`/users/admin/customers/${customerId}/cod`, payload);
    return unwrap<{ message: string }>(res);
  },

  setStatus: async (customerId: string, payload: SetCustomerStatusPayload) => {
    const res = await apiClient.patch(`/users/admin/customers/${customerId}/status`, payload);
    return unwrap<{ message: string }>(res);
  },

  addNote: async (customerId: string, payload: AddCustomerNotePayload) => {
    const res = await apiClient.patch(`/users/admin/customers/${customerId}/note`, payload);
    return unwrap<{ message: string }>(res);
  },
};
