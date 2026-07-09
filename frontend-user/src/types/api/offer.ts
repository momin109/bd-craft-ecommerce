export type OfferType = "FLASH_SALE" | "BUNDLE";

export type OfferStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "INACTIVE";

export type FlashSaleItemStatus = "ACTIVE" | "INACTIVE";

export interface OfferProductLite {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  images?: string[];
  baseSellingPrice?: number;
  sellingPrice?: number;
}

export interface FlashSaleItem {
  _id?: string;
  product: string | OfferProductLite;
  variantId?: string;

  regularPrice?: number;
  flashPrice: number;

  stockLimit?: number;
  soldCount?: number;
  perUserLimit?: number;

  status?: FlashSaleItemStatus;
}

export interface BundleItem {
  product: string | OfferProductLite;
  variantId?: string;
  quantity: number;
}

export interface BundleConfig {
  items: BundleItem[];
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscount?: number;
}

export interface ApiOffer {
  _id?: string;
  id?: string;

  code: string;
  title: string;
  description?: string;

  type: OfferType;

  startDate: string;
  endDate: string;

  priority?: number;
  usageLimit?: number;
  usedCount?: number;

  bannerImage?: string;

  flashSaleItems?: FlashSaleItem[];
  bundle?: BundleConfig;

  status: OfferStatus;
}

// export type OfferType = "FLASH_SALE" | "BUNDLE";
// export type OfferStatus = "ACTIVE" | "INACTIVE";
// export type BundleDiscountType = "PERCENTAGE" | "FIXED";

// export interface FlashSaleItem {
//   product: string;
//   variantId?: string;
//   flashPrice: number;
//   stockLimit?: number;
// }

// export interface BundleItem {
//   product: string;
//   variantId?: string;
//   quantity: number;
// }

// export interface BundleConfig {
//   items: BundleItem[];
//   discountType: BundleDiscountType;
//   discountValue: number;
//   maxDiscount?: number;
// }

// export interface ApiOffer {
//   _id?: string;
//   id?: string;
//   code: string;
//   title: string;
//   description?: string;
//   type: OfferType;
//   startDate: string;
//   endDate: string;
//   priority?: number;
//   usageLimit?: number;
//   flashSaleItems?: FlashSaleItem[];
//   bundle?: BundleConfig;
//   status: OfferStatus;
// }

// export interface CreateOfferPayload {
//   code: string;
//   title: string;
//   description?: string;
//   type: OfferType;
//   startDate: string;
//   endDate: string;
//   priority?: number;
//   usageLimit?: number;
//   flashSaleItems?: FlashSaleItem[];
//   bundle?: BundleConfig;
//   status: OfferStatus;
// }

// export interface AppliedOfferPreview {
//   code: string;
//   title: string;
//   type: OfferType;
//   discountAmount: number;
// }

// export interface CartOfferPreview {
//   subtotal: number;
//   offerDiscount: number;
//   totalAfterOffer: number;
//   appliedOffers: AppliedOfferPreview[];
// }
