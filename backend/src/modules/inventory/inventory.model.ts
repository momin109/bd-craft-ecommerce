import { Schema, model } from "mongoose";
import { IStockAdjustment } from "./inventory.interface.js";

const stockAdjustmentSchema = new Schema<IStockAdjustment>(
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
      index: true,
    },

    type: {
      type: String,
      enum: [
        "MANUAL_IN",
        "MANUAL_OUT",
        "DAMAGE",
        "LOST",
        "RETURN_RESTOCK",
        "ORDER_DEDUCT",
        "ORDER_CANCEL_RESTORE",
      ],
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },

    newStock: {
      type: Number,
      required: true,
      min: 0,
    },

    referenceType: {
      type: String,
      enum: ["MANUAL", "ORDER", "RETURN", "SYSTEM"],
      required: true,
      index: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },

    note: {
      type: String,
      trim: true,
    },

    adjustedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

stockAdjustmentSchema.index({
  product: 1,
  variantId: 1,
  createdAt: -1,
});

export const StockAdjustment = model<IStockAdjustment>(
  "StockAdjustment",
  stockAdjustmentSchema,
);
