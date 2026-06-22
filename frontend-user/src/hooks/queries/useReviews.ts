"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CreateReviewPayload, AdminReviewQuery, ReviewStatusPayload } from "@/types/api/review";

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId),
    queryFn: () => reviewService.getByProduct(productId),
    enabled: !!productId,
  });
}

export function useMyReviews() {
  return useQuery({ queryKey: queryKeys.reviews.my, queryFn: () => reviewService.getMyReviews() });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(variables.productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.my });
    },
  });
}

// Admin
export function useAdminReviews(params: AdminReviewQuery = {}) {
  return useQuery({ queryKey: queryKeys.reviews.admin(params), queryFn: () => reviewService.adminGetAll(params) });
}

export function useSetReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: ReviewStatusPayload }) =>
      reviewService.adminSetStatus(reviewId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, adminNote }: { reviewId: string; adminNote?: string }) =>
      reviewService.adminHide(reviewId, adminNote),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
