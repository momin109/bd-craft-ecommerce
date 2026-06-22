export type ReviewStatus = "PENDING" | "APPROVED" | "HIDDEN";

export interface ApiReview {
  _id?: string;
  id?: string;
  orderId: string;
  productId: string;
  variantId?: string;
  userId?: string;
  userName?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: ReviewStatus;
  adminNote?: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  orderId: string;
  productId: string;
  variantId?: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface AdminReviewQuery {
  status?: ReviewStatus;
  productId?: string;
  page?: number;
  limit?: number;
}

export interface ReviewStatusPayload {
  status: ReviewStatus;
  adminNote?: string;
}
