import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { NotificationService } from "./notification.service.js";

const getNotificationLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.getNotificationLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification logs retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const sendCustomNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.sendCustomNotification(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification processed successfully",
      data: result,
    });
  },
);

export const NotificationController = {
  getNotificationLogs,
  sendCustomNotification,
};
