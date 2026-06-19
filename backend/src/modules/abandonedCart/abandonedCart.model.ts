import { Schema, model } from "mongoose";
import { IAbandonedCartLog } from "./abandonedCart.interface.js";

const abandonedCartLogSchema = new Schema<IAbandonedCartLog>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
      index: true,
    },

    cartSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },

    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["SENT", "FAILED", "SKIPPED"],
      required: true,
      index: true,
    },

    sentChannels: {
      type: [String],
      default: [],
    },

    errorMessage: {
      type: String,
    },

    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

abandonedCartLogSchema.index({
  customer: 1,
  cart: 1,
  createdAt: -1,
});

export const AbandonedCartLog = model<IAbandonedCartLog>(
  "AbandonedCartLog",
  abandonedCartLogSchema,
);
