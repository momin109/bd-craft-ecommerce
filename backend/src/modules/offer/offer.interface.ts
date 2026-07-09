import { Types } from "mongoose";

export type TOfferType = "FLASH_SALE" | "BUNDLE";

export type TOfferStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "INACTIVE";

export type TFlashSaleItemStatus = "ACTIVE" | "INACTIVE";

export type TOfferDiscountType = "PERCENTAGE" | "FIXED";

export interface IFlashSaleItem {
  product: Types.ObjectId;
  variantId?: Types.ObjectId;

  regularPrice?: number;
  flashPrice: number;

  stockLimit?: number;
  soldCount: number;

  perUserLimit?: number;

  status?: TFlashSaleItemStatus;
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
  _id: Types.ObjectId;

  code: string;
  title: string;
  description?: string;

  type: TOfferType;

  startDate: Date;
  endDate: Date;

  usageLimit?: number;
  usedCount: number;

  priority: number;

  bannerImage?: string;

  flashSaleItems: IFlashSaleItem[];

  bundle?: IBundleOffer;

  status: TOfferStatus;

  createdBy?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
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

  createdAt?: Date;
  updatedAt?: Date;
}
