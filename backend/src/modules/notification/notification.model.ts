import { Schema, model } from "mongoose";
import { INotificationLog } from "./notification.interface.js";

const notificationLogSchema = new Schema<INotificationLog>(
  {
    channel: {
      type: String,
      enum: ["SMS", "EMAIL", "WHATSAPP"],
      required: true,
      index: true,
    },

    event: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "COURIER_BOOKED",
        "ORDER_STATUS_UPDATED",
        "ORDER_DELIVERED",
        "ORDER_RETURNED",
        "CUSTOM",
      ],
      required: true,
      index: true,
    },

    recipient: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },

    provider: {
      type: String,
      trim: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    errorMessage: {
      type: String,
    },

    rawResponse: {
      type: Schema.Types.Mixed,
    },

    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

notificationLogSchema.index({ createdAt: -1 });
notificationLogSchema.index({ channel: 1, status: 1, createdAt: -1 });

export const NotificationLog = model<INotificationLog>(
  "NotificationLog",
  notificationLogSchema,
);
