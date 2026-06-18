import { Schema, model } from "mongoose";
import {
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

    flashSaleItems: {
      type: [flashSaleItemSchema],
      default: [],
    },

    bundle: {
      type: bundleOfferSchema,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
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

const appliedOfferItemSchema = new Schema<IAppliedOfferItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
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

export const OfferCampaign = model<IOfferCampaign>(
  "OfferCampaign",
  offerCampaignSchema,
);

export const OfferRedemption = model<IOfferRedemption>(
  "OfferRedemption",
  offerRedemptionSchema,
);
