import { Types } from "mongoose";

export type TOfferType = "FLASH_SALE" | "BUNDLE";
export type TOfferStatus = "ACTIVE" | "INACTIVE";
export type TOfferDiscountType = "PERCENTAGE" | "FIXED";

export interface IFlashSaleItem {
  product: Types.ObjectId;
  variantId?: Types.ObjectId;

  flashPrice: number;

  stockLimit?: number;
  soldCount: number;
}

export interface IBundleItem {
  product: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
}

export interface IBundleOffer {
  items: IBundleItem[];

  discountType: TOfferDiscountType;
  discountValue: number;
  maxDiscount?: number;
}

export interface IOfferCampaign {
  code: string;
  title: string;
  description?: string;

  type: TOfferType;

  startDate: Date;
  endDate: Date;

  usageLimit?: number;
  usedCount: number;

  priority: number;

  flashSaleItems: IFlashSaleItem[];

  bundle?: IBundleOffer;

  status: TOfferStatus;

  createdBy?: Types.ObjectId;
}

export interface IAppliedOfferItem {
  product: Types.ObjectId;
  variantId?: Types.ObjectId;

  quantity: number;

  regularUnitPrice: number;
  offerUnitPrice?: number;

  discountAmount: number;
}

export interface IAppliedOffer {
  offer: Types.ObjectId;
  code: string;
  title: string;
  type: TOfferType;

  discountAmount: number;

  items: IAppliedOfferItem[];
}

export interface IOfferRedemption {
  offer: Types.ObjectId;
  code: string;
  type: TOfferType;

  customer: Types.ObjectId;
  order: Types.ObjectId;

  discountAmount: number;

  items: IAppliedOfferItem[];

  releasedAt?: Date;
  usedAt: Date;
}
