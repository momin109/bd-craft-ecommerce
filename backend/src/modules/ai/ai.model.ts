import { Schema, model } from "mongoose";
import { IAiGenerationLog } from "./ai.interface.js";

const aiProductCopySchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    metaTitle: {
      type: String,
      required: true,
      trim: true,
    },

    metaDescription: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    facebookAdPrimaryText: {
      type: String,
      required: true,
      trim: true,
    },

    facebookAdHeadline: {
      type: String,
      required: true,
      trim: true,
    },

    searchKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const aiGenerationLogSchema = new Schema<IAiGenerationLog>(
  {
    type: {
      type: String,
      enum: ["PRODUCT_COPY"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["GENERATED", "APPLIED", "FAILED"],
      required: true,
      index: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },

    language: {
      type: String,
      enum: ["bn", "en"],
      required: true,
      index: true,
    },

    inputPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },

    outputPayload: {
      type: aiProductCopySchema,
    },

    provider: {
      type: String,
      enum: ["OPENAI", "MOCK"],
      required: true,
    },

    model: {
      type: String,
    },

    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    appliedAt: {
      type: Date,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

aiGenerationLogSchema.index({
  product: 1,
  createdAt: -1,
});

export const AiGenerationLog = model<IAiGenerationLog>(
  "AiGenerationLog",
  aiGenerationLogSchema,
);
