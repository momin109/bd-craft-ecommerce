import { Schema, model } from "mongoose";
import { IPaymentTransaction } from "./payment.interface.js";

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
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

    gateway: {
      type: String,
      enum: ["SSLCOMMERZ", "AAMARPAY", "SHURJOPAY"],
      required: true,
      index: true,
    },

    tranId: {
      type: String,
      required: true,
      index: true,
    },

    gatewayTransactionId: {
      type: String,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["BDT"],
      default: "BDT",
    },

    paymentUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "CANCELLED"],
      default: "INITIATED",
      index: true,
    },

    rawInitResponse: {
      type: Schema.Types.Mixed,
    },

    rawVerifyResponse: {
      type: Schema.Types.Mixed,
    },

    rawCallbackPayload: {
      type: Schema.Types.Mixed,
    },

    paidAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

paymentTransactionSchema.index({ gateway: 1, tranId: 1 }, { unique: true });

export const PaymentTransaction = model<IPaymentTransaction>(
  "PaymentTransaction",
  paymentTransactionSchema,
);
