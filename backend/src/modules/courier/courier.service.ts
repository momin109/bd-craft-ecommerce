import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Order } from "../order/order.model.js";
import { OrderService } from "../order/order.service.js";

import { CourierShipment } from "./courier.model.js";
import { TCourierProvider } from "./courier.interface.js";
import { TCourierBookPayload } from "./courier.types.js";

import { steadfastAdapter } from "./gateways/steadfast.adapter.js";
import { pathaoAdapter } from "./gateways/pathao.adapter.js";

import { NotificationService } from "../notification/notification.service.js";

const getCourierAdapter = (provider: TCourierProvider) => {
  if (provider === "STEADFAST") {
    return steadfastAdapter;
  }

  if (provider === "PATHAO") {
    return pathaoAdapter;
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Unsupported courier provider");
};

const bookCourierForOrder = async (
  orderId: string,
  adminId: string,
  payload: TCourierBookPayload,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  if (!["APPROVED", "PROCESSING"].includes(order.orderStatus)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Courier can be booked only after order approval",
    );
  }

  if (order.paymentMethod !== "COD" && order.paymentStatus !== "PAID") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Online payment order must be paid before courier booking",
    );
  }

  const existingShipment = await CourierShipment.findOne({
    order: order._id,
    bookingStatus: "BOOKED",
  });

  if (existingShipment) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Courier shipment already booked for this order",
    );
  }

  const shipment = await CourierShipment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    provider: payload.provider,

    bookingStatus: "PENDING",

    recipientName: order.shippingAddress.fullName,
    recipientPhone: order.shippingAddress.mobile,
    recipientAddress: order.shippingAddress.addressLine,
    district: order.shippingAddress.district,
    city: order.shippingAddress.city,
    area: order.shippingAddress.area,

    codAmount: order.paymentMethod === "COD" ? order.totalPayable : 0,
    itemWeight: payload.itemWeight || 1,
    itemDescription:
      payload.itemDescription ||
      order.items.map((item) => item.name).join(", "),
    specialInstruction: payload.specialInstruction || order.customerNote,

    deliveryStatus: "PENDING",

    bookedBy: new Types.ObjectId(adminId),
  });

  try {
    const adapter = getCourierAdapter(payload.provider);

    const courierResult = await adapter.createShipment({
      order,
      itemWeight: payload.itemWeight || 1,
      itemDescription: shipment.itemDescription,
      specialInstruction: shipment.specialInstruction,
    });

    shipment.bookingStatus = "BOOKED";
    shipment.consignmentId = courierResult.consignmentId;
    shipment.trackingCode = courierResult.trackingCode;
    shipment.trackingUrl = courierResult.trackingUrl;
    shipment.deliveryStatus = courierResult.deliveryStatus;
    shipment.courierStatusText = courierResult.courierStatusText;
    shipment.charge = courierResult.charge;
    shipment.rawCreateResponse = courierResult.rawResponse;
    shipment.bookedAt = new Date();

    await shipment.save();

    order.courier = {
      provider: payload.provider,
      consignmentId: courierResult.consignmentId,
      trackingCode: courierResult.trackingCode,
      trackingUrl: courierResult.trackingUrl,
      deliveryStatus: courierResult.courierStatusText,
    };

    order.orderStatus = "SHIPPED";
    order.statusLogs.push({
      status: "SHIPPED",
      note: `Courier booked via ${payload.provider}`,
      changedBy: new Types.ObjectId(adminId),
      changedAt: new Date(),
    });

    await order.save();

    NotificationService.sendCourierBookedNotification(String(order._id)).catch(
      (error) => {
        console.error("Courier booked notification failed:", error);
      },
    );

    return {
      order,
      shipment,
    };
  } catch (error: any) {
    shipment.bookingStatus = "FAILED";
    shipment.errorMessage = error.message || "Courier booking failed";
    await shipment.save();

    throw error;
  }
};

const getShipmentByOrder = async (orderId: string) => {
  const shipment = await CourierShipment.findOne({
    order: orderId,
  }).sort({ createdAt: -1 });

  if (!shipment) {
    throw new AppError(httpStatus.NOT_FOUND, "Courier shipment not found");
  }

  return shipment;
};

const syncShipmentStatus = async (shipmentId: string) => {
  const shipment = await CourierShipment.findById(shipmentId);

  if (!shipment) {
    throw new AppError(httpStatus.NOT_FOUND, "Courier shipment not found");
  }

  if (!shipment.trackingCode && !shipment.consignmentId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Tracking code or consignment ID not found",
    );
  }

  const adapter = getCourierAdapter(shipment.provider);

  const statusResult = await adapter.getShipmentStatus(
    shipment.trackingCode || shipment.consignmentId!,
  );

  shipment.deliveryStatus = statusResult.deliveryStatus;
  shipment.courierStatusText = statusResult.courierStatusText;
  shipment.rawStatusResponse = statusResult.rawResponse;
  shipment.lastSyncedAt = new Date();

  await shipment.save();

  const order = await Order.findById(shipment.order);

  if (order) {
    order.courier.deliveryStatus = shipment.courierStatusText;

    if (shipment.deliveryStatus === "DELIVERED") {
      await OrderService.updateOrderStatusBySystem(
        String(order._id),
        "DELIVERED",
        `Courier status synced: ${shipment.courierStatusText || "Delivered"}`,
      );
    } else if (shipment.deliveryStatus === "RETURNED") {
      await OrderService.updateOrderStatusBySystem(
        String(order._id),
        "RETURNED",
        `Courier status synced: ${shipment.courierStatusText || "Returned"}`,
      );
    } else if (shipment.deliveryStatus === "CANCELLED") {
      await OrderService.updateOrderStatusBySystem(
        String(order._id),
        "CANCELLED",
        `Courier status synced: ${shipment.courierStatusText || "Cancelled"}`,
      );
    } else {
      await order.save();
    }
  }

  return shipment;
};

const getAllShipments = async (query: {
  provider?: TCourierProvider;
  status?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.provider) {
    filter.provider = query.provider;
  }

  if (query.status) {
    filter.deliveryStatus = query.status;
  }

  const [shipments, total] = await Promise.all([
    CourierShipment.find(filter)
      .populate("order", "orderNumber orderStatus paymentStatus totalPayable")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CourierShipment.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: shipments,
  };
};

export const CourierService = {
  bookCourierForOrder,
  getShipmentByOrder,
  syncShipmentStatus,
  getAllShipments,
};
