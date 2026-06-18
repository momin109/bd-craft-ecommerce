import { Types } from "mongoose";
import { NotificationService } from "../notification/notification.service.js";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Order } from "../order/order.model.js";
import { User } from "../user/user.model.js";

import {
  TOnlinePaymentGateway,
  TPaymentTransactionStatus,
} from "./payment.interface.js";

import { PaymentTransaction } from "./payment.model.js";
import { sslcommerzAdapter } from "./gateways/sslcommerz.adapter.js";
import { aamarpayAdapter } from "./gateways/aamarpay.adapter.js";
import { shurjopayAdapter } from "./gateways/shurjopay.adapter.js";
import { TGatewayVerifyResponse } from "./payment.types.js";

const getGatewayAdapter = (gateway: TOnlinePaymentGateway) => {
  if (gateway === "SSLCOMMERZ") {
    return sslcommerzAdapter;
  }

  if (gateway === "AAMARPAY") {
    return aamarpayAdapter;
  }

  if (gateway === "SHURJOPAY") {
    return shurjopayAdapter;
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Unsupported payment gateway");
};

const getCallbackTransactionKey = (
  gateway: TOnlinePaymentGateway,
  payload: Record<string, unknown>,
) => {
  if (gateway === "SSLCOMMERZ") {
    return {
      tranId: String(payload.tran_id || ""),
      gatewayTransactionId: String(payload.val_id || ""),
    };
  }

  if (gateway === "AAMARPAY") {
    return {
      tranId: String(payload.mer_txnid || payload.tran_id || ""),
      gatewayTransactionId: String(payload.pg_txnid || ""),
    };
  }

  return {
    tranId: String(payload.customer_order_id || payload.value2 || ""),
    gatewayTransactionId: String(payload.order_id || payload.sp_order_id || ""),
  };
};

const initiatePayment = async (
  userId: string,
  orderId: string,
  customerIp?: string,
) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: userId,
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.paymentMethod === "COD") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "COD order does not need online payment",
    );
  }

  if (order.paymentStatus === "PAID") {
    throw new AppError(httpStatus.BAD_REQUEST, "Order is already paid");
  }

  if (order.orderStatus !== "PENDING") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment can be initiated only for pending order",
    );
  }

  const gateway = order.paymentMethod as TOnlinePaymentGateway;

  let paymentTransaction = await PaymentTransaction.findOne({
    order: order._id,
    gateway,
    status: "INITIATED",
  });

  if (!paymentTransaction) {
    paymentTransaction = await PaymentTransaction.create({
      order: order._id,
      orderNumber: order.orderNumber,
      gateway,
      tranId: order.orderNumber,
      amount: order.totalPayable,
      currency: "BDT",
      status: "INITIATED",
    });
  }

  const customer = await User.findById(userId);

  const adapter = getGatewayAdapter(gateway);

  const initResult = await adapter.initiatePayment({
    order,
    paymentTransaction,
    customerEmail: customer?.email,
    customerIp,
  });

  paymentTransaction.paymentUrl = initResult.paymentUrl;
  paymentTransaction.gatewayTransactionId = initResult.gatewayTransactionId;
  paymentTransaction.rawInitResponse = initResult.rawResponse;
  await paymentTransaction.save();

  return {
    gateway,
    orderId: order._id,
    orderNumber: order.orderNumber,
    amount: order.totalPayable,
    paymentUrl: initResult.paymentUrl,
  };
};

const findPaymentTransactionFromCallback = async (
  gateway: TOnlinePaymentGateway,
  payload: Record<string, unknown>,
) => {
  const key = getCallbackTransactionKey(gateway, payload);

  let paymentTransaction = null;

  if (key.tranId) {
    paymentTransaction = await PaymentTransaction.findOne({
      gateway,
      tranId: key.tranId,
    });
  }

  if (!paymentTransaction && key.gatewayTransactionId) {
    paymentTransaction = await PaymentTransaction.findOne({
      gateway,
      gatewayTransactionId: key.gatewayTransactionId,
    });
  }

  if (!paymentTransaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  return paymentTransaction;
};

const updatePaymentAndOrder = async (
  paymentTransactionId: Types.ObjectId,
  verifyResult: TGatewayVerifyResponse,
  callbackPayload: Record<string, unknown>,
) => {
  const paymentTransaction =
    await PaymentTransaction.findById(paymentTransactionId);

  if (!paymentTransaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  const order = await Order.findById(paymentTransaction.order);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (
    paymentTransaction.status === "SUCCESS" &&
    order.paymentStatus === "PAID"
  ) {
    return {
      order,
      paymentTransaction,
    };
  }

  let status: TPaymentTransactionStatus = "FAILED";

  if (verifyResult.isSuccess) {
    status = "SUCCESS";
  } else if (verifyResult.isCancelled) {
    status = "CANCELLED";
  } else if (verifyResult.isFailed) {
    status = "FAILED";
  }

  paymentTransaction.status = status;
  paymentTransaction.gatewayTransactionId =
    verifyResult.gatewayTransactionId ||
    paymentTransaction.gatewayTransactionId;
  paymentTransaction.rawVerifyResponse = verifyResult.rawResponse;
  paymentTransaction.rawCallbackPayload = callbackPayload;

  if (status === "SUCCESS") {
    paymentTransaction.paidAt = new Date();

    order.paymentStatus = "PAID";
    order.transactionId =
      verifyResult.bankTransactionId ||
      verifyResult.gatewayTransactionId ||
      paymentTransaction.tranId;

    order.statusLogs.push({
      status: order.orderStatus,
      note: `Payment received via ${paymentTransaction.gateway}`,
      changedAt: new Date(),
    });
  }

  if (status === "FAILED") {
    paymentTransaction.failedAt = new Date();
    order.paymentStatus = "FAILED";
  }

  if (status === "CANCELLED") {
    paymentTransaction.cancelledAt = new Date();
    order.paymentStatus = "CANCELLED";
  }

  await paymentTransaction.save();
  await order.save();

  if (status === "SUCCESS") {
    NotificationService.sendPaymentSuccessNotification(String(order._id)).catch(
      (error) => {
        console.error("Payment success notification failed:", error);
      },
    );
  }

  if (status === "FAILED" || status === "CANCELLED") {
    NotificationService.sendPaymentFailedNotification(String(order._id)).catch(
      (error) => {
        console.error("Payment failed notification failed:", error);
      },
    );
  }

  return {
    order,
    paymentTransaction,
  };
};

const handleCallback = async (
  gateway: TOnlinePaymentGateway,
  callbackType: "success" | "fail" | "cancel" | "ipn",
  payload: Record<string, unknown>,
) => {
  const paymentTransaction = await findPaymentTransactionFromCallback(
    gateway,
    payload,
  );

  const adapter = getGatewayAdapter(gateway);

  let verifyResult: TGatewayVerifyResponse;

  if (callbackType === "fail") {
    verifyResult = {
      isSuccess: false,
      isFailed: true,
      isCancelled: false,
      rawResponse: payload,
    };
  } else if (callbackType === "cancel") {
    verifyResult = {
      isSuccess: false,
      isFailed: false,
      isCancelled: true,
      rawResponse: payload,
    };
  } else {
    verifyResult = await adapter.verifyPayment({
      paymentTransaction,
      callbackPayload: payload,
    });
  }

  const result = await updatePaymentAndOrder(
    paymentTransaction._id,
    verifyResult,
    payload,
  );

  return {
    callbackType,
    gateway,
    paymentStatus: result.order.paymentStatus,
    orderStatus: result.order.orderStatus,
    orderNumber: result.order.orderNumber,
  };
};

export const PaymentService = {
  initiatePayment,
  handleCallback,
};
