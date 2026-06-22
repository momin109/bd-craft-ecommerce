import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Product } from "../product/product.model.js";
import {
  TStockAdjustmentType,
  TStockReferenceType,
} from "./inventory.interface.js";
import { StockAdjustment } from "./inventory.model.js";

const stockIncreaseTypes: TStockAdjustmentType[] = [
  "MANUAL_IN",
  "RETURN_RESTOCK",
  "ORDER_CANCEL_RESTORE",
];

const stockDecreaseTypes: TStockAdjustmentType[] = [
  "MANUAL_OUT",
  "DAMAGE",
  "LOST",
  "ORDER_DEDUCT",
];

const adjustVariantStock = async (payload: {
  productId: string;
  variantId: string;
  type: TStockAdjustmentType;
  quantity: number;
  referenceType: TStockReferenceType;
  referenceId?: string;
  note?: string;
  adjustedBy?: string;
}) => {
  const product = await Product.findById(payload.productId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const variant = product.variants.find((item) => {
    return String(item._id) === payload.variantId;
  });

  if (!variant) {
    throw new AppError(httpStatus.NOT_FOUND, "Product variant not found");
  }

  const previousStock = variant.stock;

  let newStock = previousStock;

  if (stockIncreaseTypes.includes(payload.type)) {
    newStock = previousStock + payload.quantity;
  }

  if (stockDecreaseTypes.includes(payload.type)) {
    newStock = previousStock - payload.quantity;
  }

  if (newStock < 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient stock. Current stock is ${previousStock}`,
    );
  }

  variant.stock = newStock;

  product.totalStock = product.variants.reduce((sum, item) => {
    return sum + Number(item.stock || 0);
  }, 0);

  await product.save();

  const adjustment = await StockAdjustment.create({
    product: product._id,
    variantId: variant._id,
    sku: variant.sku,
    type: payload.type,
    quantity: payload.quantity,
    previousStock,
    newStock,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId
      ? new Types.ObjectId(payload.referenceId)
      : undefined,
    note: payload.note,
    adjustedBy: payload.adjustedBy
      ? new Types.ObjectId(payload.adjustedBy)
      : undefined,
  });

  return {
    product,
    variant,
    adjustment,
  };
};

const manualStockAdjustment = async (
  adminId: string,
  payload: {
    productId: string;
    variantId: string;
    type: "MANUAL_IN" | "MANUAL_OUT" | "DAMAGE" | "LOST";
    quantity: number;
    note?: string;
  },
) => {
  return adjustVariantStock({
    productId: payload.productId,
    variantId: payload.variantId,
    type: payload.type,
    quantity: payload.quantity,
    referenceType: "MANUAL",
    note: payload.note,
    adjustedBy: adminId,
  });
};

const getStockAdjustmentLogs = async (query: {
  productId?: string;
  variantId?: string;
  sku?: string;
  type?: TStockAdjustmentType;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.productId) {
    filter.product = query.productId;
  }

  if (query.variantId) {
    filter.variantId = query.variantId;
  }

  if (query.sku) {
    filter.sku = new RegExp(query.sku, "i");
  }

  if (query.type) {
    filter.type = query.type;
  }

  const [logs, total] = await Promise.all([
    StockAdjustment.find(filter)
      .populate("product", "name slug images")
      .populate("adjustedBy", "name mobile")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    StockAdjustment.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: logs,
  };
};

export const InventoryService = {
  adjustVariantStock,
  manualStockAdjustment,
  getStockAdjustmentLogs,
};
