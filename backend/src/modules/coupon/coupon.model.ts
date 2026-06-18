import { Schema, model } from "mongoose";
import { ICoupon, ICouponRedemption } from "./coupon.interface.js";

const couponSchema = new Schema<ICoupon>(
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

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
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

    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },

    scope: {
      type: String,
      enum: ["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES"],
      default: "ALL_PRODUCTS",
    },

    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    excludedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

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

const couponRedemptionSchema = new Schema<ICouponRedemption>(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
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

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

couponRedemptionSchema.index(
  {
    coupon: 1,
    customer: 1,
    order: 1,
  },
  {
    unique: true,
  },
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);

export const CouponRedemption = model<ICouponRedemption>(
  "CouponRedemption",
  couponRedemptionSchema,
);
