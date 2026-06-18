import { env } from "../../config/env.js";
import { CourierService } from "../courier/courier.service.js";
import { NotificationService } from "../notification/notification.service.js";

import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { OrderService } from "./order.service.js";

// const checkoutFromCart = catchAsync(async (req: Request, res: Response) => {
//   const result = await OrderService.checkoutFromCart(
//     req.user!.userId,
//     req.body,
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Order placed successfully",
//     data: result,
//   });
// });

const checkoutFromCart = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.checkoutFromCart(req.user!.userId, req.body);

  NotificationService.sendOrderPlacedNotification(String(order._id)).catch(
    (error) => {
      console.error("Order placed notification failed:", error);
    },
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.updateOrderStatus(
    req.params.orderId,
    req.user!.userId,
    req.body,
  );

  let courierBooking = null;

  if (
    req.body.status === "APPROVED" &&
    env.courier.autoBookOnApproval &&
    env.courier.defaultProvider !== "NONE"
  ) {
    courierBooking = await CourierService.bookCourierForOrder(
      req.params.orderId,
      req.user!.userId,
      {
        provider: env.courier.defaultProvider as "STEADFAST" | "PATHAO",
        itemWeight: 1,
        specialInstruction: "Auto booked after admin approval",
      },
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: {
      order: courierBooking?.order || order,
      courierBooking: courierBooking?.shipment || null,
    },
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const getMySingleOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMySingleOrder(
    req.user!.userId,
    req.params.orderId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.trackOrder(
    req.params.orderNumber,
    String(req.query.mobile),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order tracking retrieved successfully",
    data: result,
  });
});

const getAllOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersForAdmin(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleOrderForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.getSingleOrderForAdmin(
      req.params.orderId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  },
);

export const OrderController = {
  checkoutFromCart,
  updateOrderStatus,
  getMyOrders,
  getMySingleOrder,
  trackOrder,
  getAllOrdersForAdmin,
  getSingleOrderForAdmin,
};
