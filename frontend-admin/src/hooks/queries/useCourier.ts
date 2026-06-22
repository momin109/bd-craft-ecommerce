"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courierService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { BookCourierPayload } from "@/types/api/courier";

export function useCourierByOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.courier.byOrder(orderId),
    queryFn: () => courierService.getByOrder(orderId),
    enabled: !!orderId,
    retry: false,
  });
}

export function useBookCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: BookCourierPayload }) =>
      courierService.bookCourier(orderId, payload),
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: queryKeys.courier.byOrder(vars.orderId) }),
  });
}

export function useSyncShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) => courierService.syncStatus(shipmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courier"] }),
  });
}
