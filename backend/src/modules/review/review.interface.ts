import { Types } from "mongoose";

export type TReviewStatus = "PENDING" | "APPROVED" | "HIDDEN";

export interface IReview {
  customer: Types.ObjectId;
  product: Types.ObjectId;
  order: Types.ObjectId;
  variantId?: Types.ObjectId;

  rating: number;
  comment?: string;
  images: string[];

  status: TReviewStatus;

  adminNote?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
}
