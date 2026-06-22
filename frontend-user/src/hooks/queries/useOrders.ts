"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CheckoutPayload, UpdateOrderStatusPayload, AdminOrderQuery } from "@/types/api/order";

export function useMyOrders() {
  return useQuery({
    queryKey: queryKeys.orders.my,
    queryFn: () => orderService.getMyOrders(),
  });
}

export function useTrackOrder(orderNumber: string, mobile: string) {
  return useQuery({
    queryKey: queryKeys.orders.track(orderNumber, mobile),
    queryFn: () => orderService.trackOrder(orderNumber, mobile),
    enabled: !!orderNumber && !!mobile,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => orderService.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.my });
    },
  });
}

// Admin
export function useAdminOrders(params: AdminOrderQuery = {}) {
  return useQuery({
    queryKey: queryKeys.orders.adminAll(params),
    queryFn: () => orderService.adminGetAll(params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderStatusPayload }) =>
      orderService.adminUpdateStatus(orderId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
