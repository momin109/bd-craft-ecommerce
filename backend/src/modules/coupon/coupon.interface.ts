import { Types } from "mongoose";

export type TCouponDiscountType = "PERCENTAGE" | "FIXED";

export type TCouponScope =
  | "ALL_PRODUCTS"
  | "SPECIFIC_PRODUCTS"
  | "SPECIFIC_CATEGORIES";

export type TCouponStatus = "ACTIVE" | "INACTIVE";

export interface ICoupon {
  _id?: Types.ObjectId;
  code: string;
  title: string;
  description?: string;

  discountType: TCouponDiscountType;
  discountValue: number;
  maxDiscount?: number;

  minOrderAmount: number;

  startDate: Date;
  endDate: Date;

  usageLimit?: number;
  usedCount: number;
  perCustomerLimit: number;

  scope: TCouponScope;
  applicableProducts: Types.ObjectId[];
  applicableCategories: Types.ObjectId[];
  excludedProducts: Types.ObjectId[];

  status: TCouponStatus;

  createdBy?: Types.ObjectId;
}

export interface ICouponRedemption {
  coupon: Types.ObjectId;
  code: string;

  customer: Types.ObjectId;
  order: Types.ObjectId;

  discountAmount: number;
  usedAt: Date;
}
