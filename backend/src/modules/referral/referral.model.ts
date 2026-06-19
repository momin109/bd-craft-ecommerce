import { Schema, model } from "mongoose";
import { IReferral } from "./referral.interface.js";

const referralSchema = new Schema<IReferral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referredUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    referralCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["REGISTERED", "FIRST_ORDER_DELIVERED", "REWARDED", "CANCELLED"],
      default: "REGISTERED",
      index: true,
    },

    firstOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    rewardAmount: {
      type: Number,
      default: 100,
      min: 0,
    },

    rewardCouponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },

    rewardedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

referralSchema.index({
  referrer: 1,
  createdAt: -1,
});

export const Referral = model<IReferral>("Referral", referralSchema);
