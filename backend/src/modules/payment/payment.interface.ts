import { Types } from "mongoose";

export type TOnlinePaymentGateway = "SSLCOMMERZ" | "AAMARPAY" | "SHURJOPAY";

export type TPaymentTransactionStatus =
  | "INITIATED"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export interface IPaymentTransaction {
  order: Types.ObjectId;
  orderNumber: string;

  gateway: TOnlinePaymentGateway;

  tranId: string;
  gatewayTransactionId?: string;

  amount: number;
  currency: "BDT";

  paymentUrl?: string;

  status: TPaymentTransactionStatus;

  rawInitResponse?: unknown;
  rawVerifyResponse?: unknown;
  rawCallbackPayload?: unknown;

  paidAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
}
