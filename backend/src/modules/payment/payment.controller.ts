import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { env } from "../../config/env.js";

import { PaymentService } from "./payment.service.js";
import { TOnlinePaymentGateway } from "./payment.interface.js";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initiatePayment(
    req.user!.userId,
    req.params.orderId,
    req.ip,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const handleCallback = catchAsync(async (req: Request, res: Response) => {
  const gateway = req.params.gateway as TOnlinePaymentGateway;
  const callbackType = req.params.callbackType as
    | "success"
    | "fail"
    | "cancel"
    | "ipn";

  const payload = {
    ...req.query,
    ...req.body,
  } as Record<string, unknown>;

  const result = await PaymentService.handleCallback(
    gateway,
    callbackType,
    payload,
  );

  const redirectUrl =
    result.paymentStatus === "PAID"
      ? `${env.clientPaymentSuccessUrl}?order=${result.orderNumber}`
      : result.paymentStatus === "CANCELLED"
        ? `${env.clientPaymentCancelUrl}?order=${result.orderNumber}`
        : `${env.clientPaymentFailUrl}?order=${result.orderNumber}`;

  if (callbackType === "ipn") {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "IPN received successfully",
      data: result,
    });
    return;
  }

  res.redirect(redirectUrl);
});

export const PaymentController = {
  initiatePayment,
  handleCallback,
};
