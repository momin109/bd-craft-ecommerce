import { Schema, model } from "mongoose";
import { ICourierShipment } from "./courier.interface.js";

const courierShipmentSchema = new Schema<ICourierShipment>(
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

    provider: {
      type: String,
      enum: ["STEADFAST", "PATHAO"],
      required: true,
      index: true,
    },

    bookingStatus: {
      type: String,
      enum: ["PENDING", "BOOKED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    consignmentId: {
      type: String,
      index: true,
    },

    trackingCode: {
      type: String,
      index: true,
    },

    trackingUrl: {
      type: String,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    recipientPhone: {
      type: String,
      required: true,
      trim: true,
    },

    recipientAddress: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
    },

    codAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    itemWeight: {
      type: Number,
      default: 1,
      min: 0.1,
    },

    itemDescription: {
      type: String,
      trim: true,
    },

    specialInstruction: {
      type: String,
      trim: true,
    },

    deliveryStatus: {
      type: String,
      enum: [
        "PENDING",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "PARTIAL_DELIVERED",
        "RETURNED",
        "CANCELLED",
        "UNKNOWN",
      ],
      default: "PENDING",
      index: true,
    },

    courierStatusText: {
      type: String,
      trim: true,
    },

    charge: {
      type: Number,
      min: 0,
    },

    rawCreateResponse: {
      type: Schema.Types.Mixed,
    },

    rawStatusResponse: {
      type: Schema.Types.Mixed,
    },

    errorMessage: {
      type: String,
    },

    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    bookedAt: {
      type: Date,
    },

    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

courierShipmentSchema.index(
  { provider: 1, consignmentId: 1 },
  { sparse: true },
);

courierShipmentSchema.index({ provider: 1, trackingCode: 1 }, { sparse: true });

export const CourierShipment = model<ICourierShipment>(
  "CourierShipment",
  courierShipmentSchema,
);
