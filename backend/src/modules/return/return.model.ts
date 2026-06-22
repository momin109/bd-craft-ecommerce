import { Schema, model } from "mongoose";
import { IReturnRequest } from "./return.interface.js";

const returnItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      trim: true,
    },

    color: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      enum: [
        "DAMAGED",
        "WRONG_ITEM",
        "SIZE_ISSUE",
        "QUALITY_ISSUE",
        "CUSTOMER_CHANGED_MIND",
        "OTHER",
      ],
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    restockable: {
      type: Boolean,
      default: true,
    },

    restockedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const returnRequestSchema = new Schema<IReturnRequest>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
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

    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    items: {
      type: [returnItemSchema],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "RECEIVED",
        "PARTIALLY_RESTOCKED",
        "RESTOCKED",
        "REFUNDED",
        "CANCELLED",
      ],
      default: "REQUESTED",
      index: true,
    },

    customerNote: {
      type: String,
      trim: true,
    },

    adminNote: {
      type: String,
      trim: true,
    },

    refundMethod: {
      type: String,
      enum: ["NONE", "CASH", "BKASH", "NAGAD", "BANK", "STORE_CREDIT"],
      default: "NONE",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundTransactionId: {
      type: String,
      trim: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
    },

    rejectedAt: {
      type: Date,
    },

    receivedAt: {
      type: Date,
    },

    restockedAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },

    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

returnRequestSchema.index({
  customer: 1,
  createdAt: -1,
});

returnRequestSchema.index({
  order: 1,
  status: 1,
});

export const ReturnRequest = model<IReturnRequest>(
  "ReturnRequest",
  returnRequestSchema,
);
