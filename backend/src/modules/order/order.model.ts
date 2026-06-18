import { Schema, model } from "mongoose";
import { IOrder, IOrderItem, IOrderStatusLog } from "./order.interface.js";

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
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

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
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

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    profit: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const orderStatusLogSchema = new Schema<IOrderStatusLog>(
  {
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
      ],
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    invoiceNumber: {
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

    items: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "SSLCOMMERZ", "AAMARPAY", "SHURJOPAY"],
      required: true,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "UNPAID",
      index: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    statusLogs: {
      type: [orderStatusLogSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },

    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },

    totalPayable: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    totalPurchaseCost: {
      type: Number,
      required: true,
      min: 0,
    },

    totalProfit: {
      type: Number,
      required: true,
    },

    courier: {
      provider: {
        type: String,
        enum: ["STEADFAST", "PATHAO", "MANUAL", "NONE"],
        default: "NONE",
      },

      consignmentId: {
        type: String,
        trim: true,
      },

      trackingCode: {
        type: String,
        trim: true,
      },

      trackingUrl: {
        type: String,
        trim: true,
      },

      deliveryStatus: {
        type: String,
        trim: true,
      },
    },

    isStockDeducted: {
      type: Boolean,
      default: false,
    },

    orderFingerprint: {
      type: String,
      required: true,
      index: true,
    },

    adminNote: {
      type: String,
      trim: true,
    },

    customerNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ "shippingAddress.mobile": 1, orderFingerprint: 1 });

export const Order = model<IOrder>("Order", orderSchema);
