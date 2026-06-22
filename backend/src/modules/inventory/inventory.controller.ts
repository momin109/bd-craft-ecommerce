import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { InventoryService } from "./inventory.service.js";

const manualStockAdjustment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InventoryService.manualStockAdjustment(
      req.user!.userId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Stock adjusted successfully",
      data: result,
    });
  },
);

const getStockAdjustmentLogs = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InventoryService.getStockAdjustmentLogs(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Stock adjustment logs retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const InventoryController = {
  manualStockAdjustment,
  getStockAdjustmentLogs,
};
