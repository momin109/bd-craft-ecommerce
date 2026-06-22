import { Types } from "mongoose";

export type TStockAdjustmentType =
  | "MANUAL_IN"
  | "MANUAL_OUT"
  | "DAMAGE"
  | "LOST"
  | "RETURN_RESTOCK"
  | "ORDER_DEDUCT"
  | "ORDER_CANCEL_RESTORE";

export type TStockReferenceType = "MANUAL" | "ORDER" | "RETURN" | "SYSTEM";

export interface IStockAdjustment {
  product: Types.ObjectId;
  variantId: Types.ObjectId;

  sku: string;

  type: TStockAdjustmentType;

  quantity: number;

  previousStock: number;
  newStock: number;

  referenceType: TStockReferenceType;
  referenceId?: Types.ObjectId;

  note?: string;

  adjustedBy?: Types.ObjectId;
}
