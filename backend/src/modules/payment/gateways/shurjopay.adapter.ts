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
  return env.shurjopay.isLive
    ? "https://engine.shurjopayment.com/api"
    : "https://sandbox.shurjopayment.com/api";
};

const ensureCredentials = () => {
  if (!env.shurjopay.username || !env.shurjopay.password) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "ShurjoPay credentials are missing",
    );
  }
};

type TShurjoTokenResponse = {
  token: string;
  store_id: string | number;
  token_type: string;
  sp_code: string | number;
  message: string;
};

const getToken = async (): Promise<TShurjoTokenResponse> => {
  ensureCredentials();

  const response = await fetch(`${getBaseUrl()}/get_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: env.shurjopay.username,
      password: env.shurjopay.password,
    }),
  });

  const data = (await response.json()) as TShurjoTokenResponse;

  if (!response.ok || !data.token) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "ShurjoPay token generation failed",
    );
  }

  return data;
};

const initiatePayment = async (
  payload: TGatewayInitPayload,
): Promise<TGatewayInitResponse> => {
  const { order, paymentTransaction } = payload;

  const tokenResponse = await getToken();

  const response = await fetch(`${getBaseUrl()}/secret-pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${tokenResponse.token_type || "Bearer"} ${tokenResponse.token}`,
    },
    body: JSON.stringify({
      prefix: env.shurjopay.prefix,
      token: tokenResponse.token,
      return_url: `${env.apiBaseUrl}/api/v1/payments/callback/SHURJOPAY/success`,
      cancel_url: `${env.apiBaseUrl}/api/v1/payments/callback/SHURJOPAY/cancel`,
      store_id: String(tokenResponse.store_id),

      amount: paymentTransaction.amount,
      order_id: paymentTransaction.tranId,
      currency: "BDT",

      customer_name: order.shippingAddress.fullName,
      customer_address: order.shippingAddress.addressLine,
      customer_email: payload.customerEmail || "customer@example.com",
      customer_phone: order.shippingAddress.mobile,
      customer_city:
        order.shippingAddress.city || order.shippingAddress.district,
      customer_post_code: "1200",
      customer_state: order.shippingAddress.district,
      customer_country: "BD",

      shipping_address: order.shippingAddress.addressLine,
      shipping_city:
        order.shippingAddress.city || order.shippingAddress.district,
      shipping_country: "BD",
      received_person_name: order.shippingAddress.fullName,
      shipping_phone_number: order.shippingAddress.mobile,

      value1: String(order._id),
      value2: order.orderNumber,
      value3: "",
      value4: "",
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok || !data.checkout_url) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "ShurjoPay payment initiation failed",
    );
  }

  return {
    paymentUrl: String(data.checkout_url),
    gatewayTransactionId: String(data.sp_order_id || ""),
    rawResponse: data,
  };
};

const verifyPayment = async (
  payload: TGatewayVerifyPayload,
): Promise<TGatewayVerifyResponse> => {
  const tokenResponse = await getToken();

  const shurjoOrderId =
    String(payload.callbackPayload.order_id || "") ||
    payload.paymentTransaction.gatewayTransactionId ||
    payload.paymentTransaction.tranId;

  const response = await fetch(`${getBaseUrl()}/verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${tokenResponse.token_type || "Bearer"} ${tokenResponse.token}`,
    },
    body: JSON.stringify({
      order_id: shurjoOrderId,
    }),
  });

  const data = (await response.json()) as unknown;
  const result = Array.isArray(data)
    ? data[0]
    : (data as Record<string, unknown>);

  const spCode = String(result?.sp_code || "");
  const amount = Number(result?.amount || result?.payable_amount || 0);

  const isSuccess =
    spCode === "1000" && amount === payload.paymentTransaction.amount;

  return {
    isSuccess,
    isFailed: !isSuccess,
    isCancelled: spCode === "1002",
    gatewayTransactionId: String(result?.order_id || shurjoOrderId),
    bankTransactionId: String(result?.bank_trx_id || ""),
    amount,
    currency: String(result?.currency || "BDT"),
    rawResponse: data,
  };
};

export const shurjopayAdapter = {
  initiatePayment,
  verifyPayment,
};
