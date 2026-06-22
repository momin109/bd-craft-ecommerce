import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Order } from "../order/order.model.js";
import { User } from "../user/user.model.js";
import { NotificationService } from "../notification/notification.service.js";
import { InventoryService } from "../inventory/inventory.service.js";

import { ReturnRequest } from "./return.model.js";
import {
  TRefundMethod,
  TReturnReason,
  TReturnStatus,
} from "./return.interface.js";

const generateReturnNumber = () => {
  const date = new Date();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `RET-${yyyy}${mm}${dd}-${random}`;
};

const getAlreadyReturnedQuantity = async (
  orderId: string,
  productId: string,
  variantId: string,
) => {
  const returns = await ReturnRequest.find({
    order: orderId,
    status: {
      $nin: ["REJECTED", "CANCELLED"],
    },
    "items.product": productId,
    "items.variantId": variantId,
  });

  let total = 0;

  for (const returnRequest of returns) {
    for (const item of returnRequest.items) {
      if (
        String(item.product) === productId &&
        String(item.variantId) === variantId
      ) {
        total += item.quantity;
      }
    }
  }

  return total;
};

const createReturnRequest = async (
  userId: string,
  payload: {
    orderId: string;
    customerNote?: string;
    items: {
      productId: string;
      variantId: string;
      quantity: number;
      reason: TReturnReason;
      note?: string;
      images?: string[];
    }[];
  },
) => {
  const order = await Order.findOne({
    _id: payload.orderId,
    customer: userId,
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (order.orderStatus !== "DELIVERED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Return request is allowed only for delivered orders",
    );
  }

  const returnItems = [];

  for (const item of payload.items) {
    const orderedItem = order.items.find((orderItem) => {
      return (
        String(orderItem.product) === item.productId &&
        String(orderItem.variantId) === item.variantId
      );
    });

    if (!orderedItem) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Returned item was not found in this order",
      );
    }

    const alreadyReturnedQuantity = await getAlreadyReturnedQuantity(
      String(order._id),
      item.productId,
      item.variantId,
    );

    const availableReturnQuantity =
      orderedItem.quantity - alreadyReturnedQuantity;

    if (item.quantity > availableReturnQuantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Return quantity exceeds available quantity for SKU ${orderedItem.sku}`,
      );
    }

    returnItems.push({
      product: orderedItem.product,
      variantId: orderedItem.variantId,
      sku: orderedItem.sku,
      name: orderedItem.name,
      size: orderedItem.size,
      color: orderedItem.color,
      quantity: item.quantity,
      unitPrice: orderedItem.unitPrice,
      reason: item.reason,
      note: item.note,
      images: item.images || [],
      restockable: true,
      restockedQuantity: 0,
    });
  }

  const refundAmount = returnItems.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);

  const returnRequest = await ReturnRequest.create({
    returnNumber: generateReturnNumber(),
    customer: order.customer,
    order: order._id,
    orderNumber: order.orderNumber,
    items: returnItems,
    status: "REQUESTED",
    customerNote: payload.customerNote,
    refundMethod: "NONE",
    refundAmount,
    requestedAt: new Date(),
  });

  NotificationService.sendNotification({
    channel: "SMS",
    event: "CUSTOM",
    recipient: order.shippingAddress.mobile,
    message:
      `Dear ${order.shippingAddress.fullName},\n\n` +
      `Your return request has been submitted.\n` +
      `Return No: ${returnRequest.returnNumber}\n` +
      `Order No: ${order.orderNumber}\n` +
      `Status: REQUESTED\n\n` +
      `We will review it soon.`,
    orderId: String(order._id),
    customerId: String(order.customer),
  }).catch((error) => {
    console.error("Return request notification failed:", error);
  });

  return returnRequest;
};

const getMyReturns = async (
  userId: string,
  query: {
    status?: TReturnStatus;
    page?: string;
    limit?: string;
  },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    customer: userId,
  };

  if (query.status) {
    filter.status = query.status;
  }

  const [returns, total] = await Promise.all([
    ReturnRequest.find(filter)
      .populate("order", "orderNumber orderStatus paymentStatus totalPayable")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    ReturnRequest.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: returns,
  };
};

const getMyReturnDetails = async (userId: string, returnId: string) => {
  const returnRequest = await ReturnRequest.findOne({
    _id: returnId,
    customer: userId,
  }).populate("order", "orderNumber orderStatus paymentStatus totalPayable");

  if (!returnRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Return request not found");
  }

  return returnRequest;
};

const getAllReturnsForAdmin = async (query: {
  status?: TReturnStatus;
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      {
        returnNumber: new RegExp(query.search, "i"),
      },
      {
        orderNumber: new RegExp(query.search, "i"),
      },
    ];
  }

  const [returns, total] = await Promise.all([
    ReturnRequest.find(filter)
      .populate("customer", "name mobile email orderStats codAllowed")
      .populate("order", "orderNumber orderStatus paymentStatus totalPayable")
      .populate("handledBy", "name mobile")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    ReturnRequest.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: returns,
  };
};

const getSingleReturnForAdmin = async (returnId: string) => {
  const returnRequest = await ReturnRequest.findById(returnId)
    .populate("customer", "name mobile email orderStats codAllowed")
    .populate("order")
    .populate("handledBy", "name mobile");

  if (!returnRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Return request not found");
  }

  return returnRequest;
};

const updateReturnStatus = async (
  adminId: string,
  returnId: string,
  payload: {
    status: "APPROVED" | "REJECTED" | "RECEIVED" | "CANCELLED";
    adminNote?: string;
  },
) => {
  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Return request not found");
  }

  if (["RESTOCKED", "REFUNDED"].includes(returnRequest.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Finalized return request cannot be updated",
    );
  }

  if (payload.status === "APPROVED" && returnRequest.status !== "REQUESTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only requested return can be approved",
    );
  }

  if (payload.status === "REJECTED" && returnRequest.status !== "REQUESTED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only requested return can be rejected",
    );
  }

  if (payload.status === "RECEIVED" && returnRequest.status !== "APPROVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only approved return can be marked as received",
    );
  }

  returnRequest.status = payload.status;
  returnRequest.adminNote = payload.adminNote;
  returnRequest.handledBy = new Types.ObjectId(adminId);

  if (payload.status === "APPROVED") {
    returnRequest.approvedAt = new Date();
  }

  if (payload.status === "REJECTED") {
    returnRequest.rejectedAt = new Date();
  }

  if (payload.status === "RECEIVED") {
    returnRequest.receivedAt = new Date();
  }

  await returnRequest.save();

  return returnRequest;
};

const restockReturnItems = async (
  adminId: string,
  returnId: string,
  payload: {
    items: {
      returnItemId: string;
      quantity: number;
      restockable: boolean;
    }[];
    adminNote?: string;
  },
) => {
  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Return request not found");
  }

  if (
    !["APPROVED", "RECEIVED", "PARTIALLY_RESTOCKED"].includes(
      returnRequest.status,
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Return must be approved or received before restocking",
    );
  }

  for (const payloadItem of payload.items) {
    const returnItem = returnRequest.items.find((item: any) => {
      return String(item._id) === payloadItem.returnItemId;
    });

    if (!returnItem) {
      throw new AppError(httpStatus.NOT_FOUND, "Return item not found");
    }

    if (!payloadItem.restockable) {
      returnItem.restockable = false;
      continue;
    }

    const remainingRestockQuantity =
      returnItem.quantity - returnItem.restockedQuantity;

    if (payloadItem.quantity > remainingRestockQuantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Restock quantity exceeds remaining quantity for SKU ${returnItem.sku}`,
      );
    }

    await InventoryService.adjustVariantStock({
      productId: String(returnItem.product),
      variantId: String(returnItem.variantId),
      type: "RETURN_RESTOCK",
      quantity: payloadItem.quantity,
      referenceType: "RETURN",
      referenceId: String(returnRequest._id),
      note:
        payload.adminNote || `Return restock for ${returnRequest.returnNumber}`,
      adjustedBy: adminId,
    });

    returnItem.restockable = true;
    returnItem.restockedQuantity += payloadItem.quantity;
  }

  const totalReturnedQuantity = returnRequest.items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  const totalRestockedQuantity = returnRequest.items.reduce((sum, item) => {
    return sum + item.restockedQuantity;
  }, 0);

  returnRequest.status =
    totalRestockedQuantity >= totalReturnedQuantity
      ? "RESTOCKED"
      : "PARTIALLY_RESTOCKED";

  returnRequest.adminNote = payload.adminNote || returnRequest.adminNote;
  returnRequest.handledBy = new Types.ObjectId(adminId);
  returnRequest.restockedAt = new Date();

  await returnRequest.save();

  return returnRequest;
};

const markReturnRefunded = async (
  adminId: string,
  returnId: string,
  payload: {
    refundMethod: TRefundMethod;
    refundAmount: number;
    refundTransactionId?: string;
    adminNote?: string;
  },
) => {
  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Return request not found");
  }

  if (
    !["RESTOCKED", "PARTIALLY_RESTOCKED", "RECEIVED"].includes(
      returnRequest.status,
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Return must be received/restocked before refund",
    );
  }

  if (payload.refundAmount > returnRequest.refundAmount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Refund amount cannot be greater than return amount",
    );
  }

  returnRequest.status = "REFUNDED";
  returnRequest.refundMethod = payload.refundMethod;
  returnRequest.refundAmount = payload.refundAmount;
  returnRequest.refundTransactionId = payload.refundTransactionId;
  returnRequest.adminNote = payload.adminNote || returnRequest.adminNote;
  returnRequest.refundedAt = new Date();
  returnRequest.handledBy = new Types.ObjectId(adminId);

  await returnRequest.save();

  const order = await Order.findById(returnRequest.order);

  if (order) {
    const totalOrderQuantity = order.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    const returnedQuantity = returnRequest.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    if (returnedQuantity >= totalOrderQuantity) {
      order.orderStatus = "RETURNED";
      order.statusLogs.push({
        status: "RETURNED",
        note: `Order marked returned by return request ${returnRequest.returnNumber}`,
        changedBy: new Types.ObjectId(adminId),
        changedAt: new Date(),
      });

      await order.save();

      const customer = await User.findById(order.customer);

      if (customer) {
        customer.orderStats.returnedOrders += 1;

        const completedOrders =
          customer.orderStats.deliveredOrders +
          customer.orderStats.returnedOrders +
          customer.orderStats.cancelledOrders;

        customer.orderStats.successRate =
          completedOrders > 0
            ? Math.round(
                (customer.orderStats.deliveredOrders / completedOrders) * 100,
              )
            : 100;

        if (
          customer.orderStats.totalOrders >= 3 &&
          customer.orderStats.successRate < 60
        ) {
          customer.codAllowed = false;
        }

        await customer.save();
      }
    }
  }

  return returnRequest;
};

export const ReturnService = {
  createReturnRequest,
  getMyReturns,
  getMyReturnDetails,
  getAllReturnsForAdmin,
  getSingleReturnForAdmin,
  updateReturnStatus,
  restockReturnItems,
  markReturnRefunded,
};
