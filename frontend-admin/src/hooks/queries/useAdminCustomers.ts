"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCustomerService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { AdminCustomerQuery, SetCodPayload, SetCustomerStatusPayload, AddCustomerNotePayload } from "@/types/api/admin-customer";
import { OrderStatus } from "@/types/api/order";

export function useAdminCustomers(params: AdminCustomerQuery = {}) {
  return useQuery({ queryKey: queryKeys.customers.all(params), queryFn: () => adminCustomerService.getAll(params) });
}

export function useAdminCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(customerId),
    queryFn: () => adminCustomerService.getDetail(customerId),
    enabled: !!customerId,
  });
}

export function useAdminCustomerOrders(customerId: string, status?: OrderStatus) {
  return useQuery({
    queryKey: queryKeys.customers.orders(customerId, status),
    queryFn: () => adminCustomerService.getOrders(customerId, status),
    enabled: !!customerId,
  });
}

export function useSetCustomerCod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: SetCodPayload }) =>
      adminCustomerService.setCod(customerId, payload),
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(vars.customerId) }),
  });
}

export function useSetCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: SetCustomerStatusPayload }) =>
      adminCustomerService.setStatus(customerId, payload),
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(vars.customerId) }),
  });
}

export function useAddCustomerNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, payload }: { customerId: string; payload: AddCustomerNotePayload }) =>
      adminCustomerService.addNote(customerId, payload),
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(vars.customerId) }),
  });
}
