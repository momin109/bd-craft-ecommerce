import { Types } from "mongoose";

export type TReturnStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "PARTIALLY_RESTOCKED"
  | "RESTOCKED"
  | "REFUNDED"
  | "CANCELLED";

export type TReturnReason =
  | "DAMAGED"
  | "WRONG_ITEM"
  | "SIZE_ISSUE"
  | "QUALITY_ISSUE"
  | "CUSTOMER_CHANGED_MIND"
  | "OTHER";

export type TRefundMethod =
  | "NONE"
  | "CASH"
  | "BKASH"
  | "NAGAD"
  | "BANK"
  | "STORE_CREDIT";

export interface IReturnItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;

  sku: string;
  name: string;

  size?: string;
  color?: string;

  quantity: number;
  unitPrice: number;

  reason: TReturnReason;
  note?: string;

  images: string[];

  restockable: boolean;
  restockedQuantity: number;
}

export interface IReturnRequest {
  returnNumber: string;

  customer: Types.ObjectId;
  order: Types.ObjectId;
  orderNumber: string;

  items: IReturnItem[];

  status: TReturnStatus;

  customerNote?: string;
  adminNote?: string;

  refundMethod: TRefundMethod;
  refundAmount: number;
  refundTransactionId?: string;

  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  receivedAt?: Date;
  restockedAt?: Date;
  refundedAt?: Date;

  handledBy?: Types.ObjectId;
}
