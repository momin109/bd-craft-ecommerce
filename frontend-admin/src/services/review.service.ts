import { apiClient, unwrap } from "@/lib/api/client";
import { ApiReview, CreateReviewPayload, AdminReviewQuery, ReviewStatusPayload } from "@/types/api/review";

export const reviewService = {
  create: async (payload: CreateReviewPayload) => {
    const res = await apiClient.post("/reviews", payload);
    return unwrap<{ message: string }>(res);
  },

  getByProduct: async (productId: string) => {
    const res = await apiClient.get(`/reviews/products/${productId}`);
    return unwrap<ApiReview[]>(res);
  },

  getMyReviews: async () => {
    const res = await apiClient.get("/reviews/my-reviews");
    return unwrap<ApiReview[]>(res);
  },

  // Admin
  adminGetAll: async (params: AdminReviewQuery = {}) => {
    const res = await apiClient.get("/reviews/admin", { params });
    return unwrap<ApiReview[]>(res);
  },

  adminSetStatus: async (reviewId: string, payload: ReviewStatusPayload) => {
    const res = await apiClient.patch(`/reviews/admin/${reviewId}/status`, payload);
    return unwrap<ApiReview>(res);
  },

  adminHide: async (reviewId: string, adminNote?: string) => {
    const res = await apiClient.patch(`/reviews/admin/${reviewId}/hide`, { adminNote });
    return unwrap<ApiReview>(res);
  },
};
