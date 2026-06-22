"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { ApplyCouponPayload, CreateCouponPayload } from "@/types/api/coupon";

export function useApplyCoupon() {
  return useMutation({ mutationFn: (payload: ApplyCouponPayload) => couponService.apply(payload) });
}

// Admin
export function useAdminCoupons() {
  return useQuery({ queryKey: queryKeys.coupons.adminAll, queryFn: () => couponService.getAll() });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => couponService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll }),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCouponPayload> }) => couponService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll }),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.coupons.adminAll }),
  });
}
