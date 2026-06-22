export type CouponDiscountType = "PERCENTAGE" | "FIXED";
export type CouponScope = "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS" | "SPECIFIC_CATEGORY";
export type CouponStatus = "ACTIVE" | "INACTIVE";

export interface ApiCoupon {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  perCustomerLimit?: number;
  scope: CouponScope;
  status: CouponStatus;
}

export interface CreateCouponPayload {
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  scope: CouponScope;
  status: CouponStatus;
}

export interface ApplyCouponPayload {
  code: string;
}

export interface ApplyCouponResult {
  couponCode: string;
  subtotal: number;
  discountAmount: number;
  totalAfterDiscount: number;
}
