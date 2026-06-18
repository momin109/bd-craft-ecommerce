import { Schema, model } from "mongoose";
import { IReview } from "./review.interface.js";

const reviewSchema = new Schema<IReview>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },

    comment: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "HIDDEN"],
      default: "PENDING",
      index: true,
    },

    adminNote: {
      type: String,
      trim: true,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    customer: 1,
    product: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.index({
  product: 1,
  status: 1,
  createdAt: -1,
});

export const Review = model<IReview>("Review", reviewSchema);
