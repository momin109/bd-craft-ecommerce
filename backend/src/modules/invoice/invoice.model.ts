import { Schema, model } from "mongoose";
import { IInvoice } from "./invoice.interface.js";

const invoiceSchema = new Schema<IInvoice>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
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

    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    pdfPath: {
      type: String,
      required: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPayable: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      required: true,
    },

    orderStatus: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["GENERATED", "EMAILED", "FAILED"],
      default: "GENERATED",
      index: true,
    },

    emailSentAt: {
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

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);
