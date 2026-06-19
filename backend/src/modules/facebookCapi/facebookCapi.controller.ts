import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { FacebookCapiService } from "./facebookCapi.service.js";

const trackEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await FacebookCapiService.trackEvent(
    req,
    req.user?.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meta event processed successfully",
    data: result,
  });
});

const getEventLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await FacebookCapiService.getEventLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Meta event logs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const FacebookCapiController = {
  trackEvent,
  getEventLogs,
};
