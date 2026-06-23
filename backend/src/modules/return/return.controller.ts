import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { ReturnService } from "./return.service.js";

const createReturnRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await ReturnService.createReturnRequest(
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Return request submitted successfully",
    data: result,
  });
});

const getMyReturns = catchAsync(async (req: Request, res: Response) => {
  const result = await ReturnService.getMyReturns(req.user!.userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My return requests retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyReturnDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await ReturnService.getMyReturnDetails(
    req.user!.userId,
    req.params.returnId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return request retrieved successfully",
    data: result,
  });
});

const getAllReturnsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReturnService.getAllReturnsForAdmin(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Return requests retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getSingleReturnForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReturnService.getSingleReturnForAdmin(
      req.params.returnId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Return request retrieved successfully",
      data: result,
    });
  },
);

const updateReturnStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ReturnService.updateReturnStatus(
    req.user!.userId,
    req.params.returnId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return status updated successfully",
    data: result,
  });
});

const restockReturnItems = catchAsync(async (req: Request, res: Response) => {
  const result = await ReturnService.restockReturnItems(
    req.user!.userId,
    req.params.returnId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return items restocked successfully",
    data: result,
  });
});

const markReturnRefunded = catchAsync(async (req: Request, res: Response) => {
  const result = await ReturnService.markReturnRefunded(
    req.user!.userId,
    req.params.returnId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Return marked as refunded successfully",
    data: result,
  });
});

export const ReturnController = {
  createReturnRequest,
  getMyReturns,
  getMyReturnDetails,
  getAllReturnsForAdmin,
  getSingleReturnForAdmin,
  updateReturnStatus,
  restockReturnItems,
  markReturnRefunded,
};
