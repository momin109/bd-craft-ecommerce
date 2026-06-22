"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { AdminReviewQuery, ReviewStatusPayload } from "@/types/api/review";

export function useAdminReviews(params: AdminReviewQuery = {}) {
  return useQuery({ queryKey: queryKeys.reviews.admin(params), queryFn: () => reviewService.adminGetAll(params) });
}

export function useSetReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: ReviewStatusPayload }) =>
      reviewService.adminSetStatus(reviewId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useHideReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, adminNote }: { reviewId: string; adminNote?: string }) => reviewService.adminHide(reviewId, adminNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
