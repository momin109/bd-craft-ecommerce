import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { AbandonedCartService } from "./abandonedCart.service.js";

const runAbandonedCartRecovery = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await AbandonedCartService.runAbandonedCartRecovery();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Abandoned cart recovery processed successfully",
      data: result,
    });
  },
);

const getAbandonedCartLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AbandonedCartService.getAbandonedCartLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Abandoned cart logs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AbandonedCartController = {
  runAbandonedCartRecovery,
  getAbandonedCartLogs,
};
