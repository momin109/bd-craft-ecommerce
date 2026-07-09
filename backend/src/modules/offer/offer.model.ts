import { Schema, model } from "mongoose";

import type {
  IAppliedOfferItem,
  IBundleItem,
  IBundleOffer,
  IFlashSaleItem,
  IOfferCampaign,
  IOfferRedemption,
} from "./offer.interface.js";

const flashSaleItemSchema = new Schema<IFlashSaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
      index: true,
    },

    regularPrice: {
      type: Number,
      min: 0,
    },

    flashPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stockLimit: {
      type: Number,
      min: 1,
    },

    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    perUserLimit: {
      type: Number,
      min: 1,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    _id: true,
  },
);

const bundleItemSchema = new Schema<IBundleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const bundleOfferSchema = new Schema<IBundleOffer>(
  {
    items: {
      type: [bundleItemSchema],
      default: [],
      validate: {
        validator(value: IBundleItem[]) {
          return Array.isArray(value) && value.length >= 2;
        },
        message: "Bundle needs at least 2 items",
      },
    },

    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const offerCampaignSchema = new Schema<IOfferCampaign>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["FLASH_SALE", "BUNDLE"],
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    usageLimit: {
      type: Number,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    priority: {
      type: Number,
      default: 0,
      index: true,
    },

    bannerImage: {
      type: String,
      trim: true,
    },

    flashSaleItems: {
      type: [flashSaleItemSchema],
      default: [],
    },

    bundle: {
      type: bundleOfferSchema,
    },

    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "EXPIRED", "INACTIVE"],
      default: "DRAFT",
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

offerCampaignSchema.index({
  status: 1,
  type: 1,
  startDate: 1,
  endDate: 1,
});

offerCampaignSchema.index({
  type: 1,
  status: 1,
  "flashSaleItems.product": 1,
  "flashSaleItems.variantId": 1,
  startDate: 1,
  endDate: 1,
});

const appliedOfferItemSchema = new Schema<IAppliedOfferItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    regularUnitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    offerUnitPrice: {
      type: Number,
      min: 0,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const offerRedemptionSchema = new Schema<IOfferRedemption>(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: "OfferCampaign",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["FLASH_SALE", "BUNDLE"],
      required: true,
      index: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    items: {
      type: [appliedOfferItemSchema],
      default: [],
    },

    releasedAt: {
      type: Date,
      index: true,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

offerRedemptionSchema.index(
  {
    offer: 1,
    order: 1,
  },
  {
    unique: true,
  },
);

offerRedemptionSchema.index({
  offer: 1,
  customer: 1,
  type: 1,
  releasedAt: 1,
});

offerRedemptionSchema.index({
  customer: 1,
  "items.product": 1,
  "items.variantId": 1,
});

export const OfferCampaign = model<IOfferCampaign>(
  "OfferCampaign",
  offerCampaignSchema,
);

export const OfferRedemption = model<IOfferRedemption>(
  "OfferRedemption",
  offerRedemptionSchema,
);
