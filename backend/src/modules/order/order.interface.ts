import { Types } from "mongoose";

export type TPaymentMethod = "COD" | "SSLCOMMERZ" | "AAMARPAY" | "SHURJOPAY";

export type TPaymentStatus =
  | "UNPAID"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type TOrderStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

export type TCourierProvider = "STEADFAST" | "PATHAO" | "MANUAL" | "NONE";

export interface IShippingAddress {
  fullName: string;
  mobile: string;
  district: string;
  city?: string;
  area?: string;
  addressLine: string;
  note?: string;
}

export interface IOrderItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;

  sku: string;
  name: string;
  image?: string;

  size?: string;
  color?: string;

  unitPrice: number;
  quantity: number;
  itemTotal: number;

  purchasePrice: number;
  profit: number;
}

export interface IOrderStatusLog {
  status: TOrderStatus;
  note?: string;
  changedBy?: Types.ObjectId;
  changedAt: Date;
}

export interface IOrder {
  orderNumber: string;
  invoiceNumber: string;

  customer: Types.ObjectId;

  items: IOrderItem[];

  shippingAddress: IShippingAddress;

  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;
  transactionId?: string;

  orderStatus: TOrderStatus;
  statusLogs: IOrderStatusLog[];

  subtotal: number;
  shippingCharge: number;
  discount: number;
  totalPayable: number;

  coupon?: Types.ObjectId;
  couponCode?: string;

  totalPurchaseCost: number;
  totalProfit: number;

  courier: {
    provider: TCourierProvider;
    consignmentId?: string;
    trackingCode?: string;
    trackingUrl?: string;
    deliveryStatus?: string;
  };

  isStockDeducted: boolean;
  orderFingerprint: string;

  adminNote?: string;
  customerNote?: string;
}
