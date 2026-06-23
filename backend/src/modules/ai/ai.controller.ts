import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { AiService } from "./ai.service.js";

const generateProductCopy = catchAsync(async (req: Request, res: Response) => {
  const result = await AiService.generateProductCopy(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AI product copy generated successfully",
    data: result,
  });
});

const generateProductCopyFromProduct = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AiService.generateProductCopyFromProduct(
      req.params.productId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "AI product copy generated from product successfully",
      data: result,
    });
  },
);

const applyAiCopyToProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await AiService.applyAiCopyToProduct(
    req.user!.userId,
    req.params.productId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AI copy applied to product successfully",
    data: result,
  });
});

const getAiGenerationLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AiService.getAiGenerationLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AI generation logs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AiController = {
  generateProductCopy,
  generateProductCopyFromProduct,
  applyAiCopyToProduct,
  getAiGenerationLogs,
};
