"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { UpdateOrderStatusPayload, AdminOrderQuery } from "@/types/api/order";

export function useAdminOrders(params: AdminOrderQuery = {}) {
  return useQuery({ queryKey: queryKeys.orders.admin(params), queryFn: () => orderService.adminGetAll(params) });
}

export function useAdminOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => orderService.adminGetOne(orderId),
    enabled: !!orderId,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderStatusPayload }) =>
      orderService.adminUpdateStatus(orderId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
