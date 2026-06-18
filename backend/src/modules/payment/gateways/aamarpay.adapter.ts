import { env } from "../../../config/env.js";
import { AppError } from "../../../errors/AppError.js";
import { httpStatus } from "../../../constants/httpStatus.js";
import {
  TGatewayInitPayload,
  TGatewayInitResponse,
  TGatewayVerifyPayload,
  TGatewayVerifyResponse,
} from "../payment.types.js";

const getBaseUrl = () => {
  return env.aamarpay.isLive
    ? "https://secure.aamarpay.com"
    : "https://sandbox.aamarpay.com";
};

const ensureCredentials = () => {
  if (!env.aamarpay.storeId || !env.aamarpay.signatureKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "aamarPay credentials are missing",
    );
  }
};

const initiatePayment = async (
  payload: TGatewayInitPayload,
): Promise<TGatewayInitResponse> => {
  ensureCredentials();

  const { order, paymentTransaction } = payload;
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/jsonpost.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      store_id: env.aamarpay.storeId,
      signature_key: env.aamarpay.signatureKey,

      tran_id: paymentTransaction.tranId,
      amount: String(paymentTransaction.amount),
      currency: "BDT",
      desc: `Order ${order.orderNumber}`,

      cus_name: order.shippingAddress.fullName,
      cus_email: payload.customerEmail || "customer@example.com",
      cus_phone: order.shippingAddress.mobile,
      cus_add1: order.shippingAddress.addressLine,
      cus_city: order.shippingAddress.city || order.shippingAddress.district,
      cus_state: order.shippingAddress.district,
      cus_country: "Bangladesh",

      success_url: `${env.apiBaseUrl}/api/v1/payments/callback/AAMARPAY/success`,
      fail_url: `${env.apiBaseUrl}/api/v1/payments/callback/AAMARPAY/fail`,
      cancel_url: `${env.apiBaseUrl}/api/v1/payments/callback/AAMARPAY/cancel`,

      opt_a: String(order._id),
      opt_b: order.orderNumber,
      type: "json",
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok || !data.payment_url) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "aamarPay payment initiation failed",
    );
  }

  return {
    paymentUrl: String(data.payment_url),
    rawResponse: data,
  };
};

const verifyPayment = async (
  payload: TGatewayVerifyPayload,
): Promise<TGatewayVerifyResponse> => {
  ensureCredentials();

  const baseUrl = getBaseUrl();

  const url = new URL(`${baseUrl}/api/v1/trxcheck/request.php`);
  url.searchParams.set("request_id", payload.paymentTransaction.tranId);
  url.searchParams.set("store_id", env.aamarpay.storeId);
  url.searchParams.set("signature_key", env.aamarpay.signatureKey);
  url.searchParams.set("type", "json");

  const response = await fetch(url);
  const data = (await response.json()) as Record<string, unknown>;

  const statusCode = String(data.status_code || "");
  const amount = Number(data.amount || data.amount_bdt || 0);

  const isSuccess =
    statusCode === "2" && amount === payload.paymentTransaction.amount;

  return {
    isSuccess,
    isFailed: !isSuccess,
    isCancelled: statusCode === "3" || statusCode === "7",
    gatewayTransactionId: String(data.pg_txnid || ""),
    bankTransactionId: String(data.bank_trxid || ""),
    amount,
    currency: String(data.currency || "BDT"),
    rawResponse: data,
  };
};

export const aamarpayAdapter = {
  initiatePayment,
  verifyPayment,
};
