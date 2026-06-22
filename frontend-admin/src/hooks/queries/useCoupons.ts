"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CreateCouponPayload } from "@/types/api/coupon";

export function useCoupons() {
  return useQuery({ queryKey: queryKeys.coupons.all, queryFn: () => couponService.getAll() });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons.all }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCouponPayload> }) => couponService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons.all }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.coupons.all }),
  });
}
