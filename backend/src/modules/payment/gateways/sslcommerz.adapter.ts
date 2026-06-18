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
  return env.sslcommerz.isLive
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
};

const ensureCredentials = () => {
  if (!env.sslcommerz.storeId || !env.sslcommerz.storePassword) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "SSLCommerz credentials are missing",
    );
  }
};

const initiatePayment = async (
  payload: TGatewayInitPayload,
): Promise<TGatewayInitResponse> => {
  ensureCredentials();

  const { order, paymentTransaction } = payload;
  const baseUrl = getBaseUrl();

  const body = new URLSearchParams();

  body.append("store_id", env.sslcommerz.storeId);
  body.append("store_passwd", env.sslcommerz.storePassword);

  body.append("total_amount", String(paymentTransaction.amount));
  body.append("currency", "BDT");
  body.append("tran_id", paymentTransaction.tranId);

  body.append(
    "success_url",
    `${env.apiBaseUrl}/api/v1/payments/callback/SSLCOMMERZ/success`,
  );
  body.append(
    "fail_url",
    `${env.apiBaseUrl}/api/v1/payments/callback/SSLCOMMERZ/fail`,
  );
  body.append(
    "cancel_url",
    `${env.apiBaseUrl}/api/v1/payments/callback/SSLCOMMERZ/cancel`,
  );
  body.append(
    "ipn_url",
    `${env.apiBaseUrl}/api/v1/payments/callback/SSLCOMMERZ/ipn`,
  );

  body.append("cus_name", order.shippingAddress.fullName);
  body.append("cus_email", payload.customerEmail || "customer@example.com");
  body.append("cus_add1", order.shippingAddress.addressLine);
  body.append(
    "cus_city",
    order.shippingAddress.city || order.shippingAddress.district,
  );
  body.append("cus_state", order.shippingAddress.district);
  body.append("cus_postcode", "1200");
  body.append("cus_country", "Bangladesh");
  body.append("cus_phone", order.shippingAddress.mobile);

  body.append("shipping_method", "YES");
  body.append("ship_name", order.shippingAddress.fullName);
  body.append("ship_add1", order.shippingAddress.addressLine);
  body.append(
    "ship_city",
    order.shippingAddress.city || order.shippingAddress.district,
  );
  body.append("ship_state", order.shippingAddress.district);
  body.append("ship_postcode", "1200");
  body.append("ship_country", "Bangladesh");

  body.append("product_name", `Order ${order.orderNumber}`);
  body.append("product_category", "Ecommerce");
  body.append("product_profile", "general");

  const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok || !data.GatewayPageURL) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "SSLCommerz payment initiation failed",
    );
  }

  return {
    paymentUrl: String(data.GatewayPageURL),
    rawResponse: data,
  };
};

const verifyPayment = async (
  payload: TGatewayVerifyPayload,
): Promise<TGatewayVerifyResponse> => {
  ensureCredentials();

  const valId = String(payload.callbackPayload.val_id || "");

  if (!valId) {
    return {
      isSuccess: false,
      isFailed: true,
      isCancelled: false,
      rawResponse: payload.callbackPayload,
    };
  }

  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}/validator/api/validationserverAPI.php`);

  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", env.sslcommerz.storeId);
  url.searchParams.set("store_passwd", env.sslcommerz.storePassword);
  url.searchParams.set("v", "1");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  const data = (await response.json()) as Record<string, unknown>;

  const status = String(data.status || "");
  const amount = Number(data.amount || 0);

  const isSuccess =
    ["VALID", "VALIDATED"].includes(status) &&
    amount === payload.paymentTransaction.amount;

  return {
    isSuccess,
    isFailed: !isSuccess,
    isCancelled: false,
    gatewayTransactionId: String(data.val_id || valId),
    bankTransactionId: String(data.bank_tran_id || ""),
    amount,
    currency: String(data.currency || "BDT"),
    rawResponse: data,
  };
};

export const sslcommerzAdapter = {
  initiatePayment,
  verifyPayment,
};
