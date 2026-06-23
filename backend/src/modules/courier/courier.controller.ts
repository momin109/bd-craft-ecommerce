import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { CourierService } from "./courier.service.js";

const bookCourierForOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await CourierService.bookCourierForOrder(
    req.params.orderId as string,
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Courier booked successfully",
    data: result,
  });
});

const getShipmentByOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await CourierService.getShipmentByOrder(
    req.params.orderId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courier shipment retrieved successfully",
    data: result,
  });
});

const syncShipmentStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await CourierService.syncShipmentStatus(
    req.params.shipmentId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courier shipment status synced successfully",
    data: result,
  });
});

const getAllShipments = catchAsync(async (req: Request, res: Response) => {
  const result = await CourierService.getAllShipments(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courier shipments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const CourierController = {
  bookCourierForOrder,
  getShipmentByOrder,
  syncShipmentStatus,
  getAllShipments,
};
