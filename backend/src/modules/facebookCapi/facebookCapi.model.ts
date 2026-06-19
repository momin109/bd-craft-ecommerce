import { Schema, model } from "mongoose";
import { IFacebookCapiEventLog } from "./facebookCapi.interface.js";

const facebookCapiEventLogSchema = new Schema<IFacebookCapiEventLog>(
  {
    eventName: {
      type: String,
      enum: ["ViewContent", "AddToCart", "InitiateCheckout", "Purchase"],
      required: true,
      index: true,
    },

    eventId: {
      type: String,
      required: true,
      index: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },

    eventSourceUrl: {
      type: String,
    },

    actionSource: {
      type: String,
      enum: ["website"],
      default: "website",
    },

    value: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["BDT"],
      default: "BDT",
    },

    contentIds: {
      type: [String],
      default: [],
    },

    contentType: {
      type: String,
      enum: ["product", "product_group"],
      default: "product",
    },

    contents: [
      {
        id: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        item_price: {
          type: Number,
          min: 0,
        },
      },
    ],

    status: {
      type: String,
      enum: ["SENT", "FAILED", "SKIPPED"],
      required: true,
      index: true,
    },

    requestPayload: {
      type: Schema.Types.Mixed,
    },

    responsePayload: {
      type: Schema.Types.Mixed,
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

facebookCapiEventLogSchema.index(
  {
    eventName: 1,
    eventId: 1,
  },
  {
    unique: true,
  },
);

export const FacebookCapiEventLog = model<IFacebookCapiEventLog>(
  "FacebookCapiEventLog",
  facebookCapiEventLogSchema,
);
