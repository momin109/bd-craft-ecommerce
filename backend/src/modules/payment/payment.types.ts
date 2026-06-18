import { IOrder } from "../order/order.interface.js";
import { IPaymentTransaction } from "./payment.interface.js";

export type TGatewayInitPayload = {
  order: IOrder;
  paymentTransaction: IPaymentTransaction;
  customerEmail?: string;
  customerIp?: string;
};

export type TGatewayInitResponse = {
  paymentUrl: string;
  gatewayTransactionId?: string;
  rawResponse: unknown;
};

export type TGatewayVerifyPayload = {
  paymentTransaction: IPaymentTransaction;
  callbackPayload: Record<string, unknown>;
};

export type TGatewayVerifyResponse = {
  isSuccess: boolean;
  isFailed: boolean;
  isCancelled: boolean;

  gatewayTransactionId?: string;
  bankTransactionId?: string;

  amount?: number;
  currency?: string;

  rawResponse: unknown;
};
