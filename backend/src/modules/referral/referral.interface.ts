import { Types } from "mongoose";

export type TReferralStatus =
  | "REGISTERED"
  | "FIRST_ORDER_DELIVERED"
  | "REWARDED"
  | "CANCELLED";

export interface IReferral {
  referrer: Types.ObjectId;
  referredUser: Types.ObjectId;

  referralCode: string;

  status: TReferralStatus;

  firstOrder?: Types.ObjectId;

  rewardAmount: number;
  rewardCouponCode?: string;

  rewardedAt?: Date;
}
