import { Schema, model } from "mongoose";
import { IFileAsset } from "./upload.interface.js";

const fileAssetSchema = new Schema<IFileAsset>(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      index: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    url: {
      type: String,
      required: true,
    },

    key: {
      type: String,
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["LOCAL", "CLOUDINARY", "S3"],
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["PRODUCT_IMAGE", "REVIEW_IMAGE", "AVATAR", "GENERAL"],
      default: "GENERAL",
      index: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    relatedProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },

    relatedReview: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

fileAssetSchema.index({
  provider: 1,
  key: 1,
});

export const FileAsset = model<IFileAsset>("FileAsset", fileAssetSchema);
