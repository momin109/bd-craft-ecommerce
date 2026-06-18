import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { Order } from "../order/order.model.js";
import { User } from "../user/user.model.js";

import { NotificationLog } from "./notification.model.js";
import {
  TNotificationChannel,
  TNotificationEvent,
} from "./notification.interface.js";
import { TSendNotificationPayload } from "./notification.types.js";

import { smsAdapter } from "./adapters/sms.adapter.js";
import { emailAdapter } from "./adapters/email.adapter.js";
import { whatsappAdapter } from "./adapters/whatsapp.adapter.js";
import { NotificationTemplates } from "./notification.templates.js";

const getAdapter = (channel: TNotificationChannel) => {
  if (channel === "SMS") {
    return smsAdapter;
  }

  if (channel === "EMAIL") {
    return emailAdapter;
  }

  if (channel === "WHATSAPP") {
    return whatsappAdapter;
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid notification channel");
};

const sendNotification = async (payload: TSendNotificationPayload) => {
  const log = await NotificationLog.create({
    channel: payload.channel,
    event: payload.event,
    recipient: payload.recipient,
    subject: payload.subject,
    message: payload.message,
    status: "PENDING",
    order: payload.orderId ? new Types.ObjectId(payload.orderId) : undefined,
    customer: payload.customerId
      ? new Types.ObjectId(payload.customerId)
      : undefined,
  });

  try {
    const adapter = getAdapter(payload.channel);

    const result = await adapter.send({
      recipient: payload.recipient,
      subject: payload.subject,
      message: payload.message,
    });

    log.status = result.skipped ? "SKIPPED" : "SENT";
    log.rawResponse = result.rawResponse;
    log.sentAt = result.skipped ? undefined : new Date();

    await log.save();

    return log;
  } catch (error: any) {
    log.status = "FAILED";
    log.errorMessage = error.message || "Notification sending failed";
    await log.save();

    return log;
  }
};

const sendOrderNotificationToCustomer = async (
  orderId: string,
  event: TNotificationEvent,
  template: {
    subject: string;
    message: string;
  },
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const customer = await User.findById(order.customer);

  const tasks = [];

  tasks.push(
    sendNotification({
      channel: "SMS",
      event,
      recipient: order.shippingAddress.mobile,
      message: template.message,
      orderId: String(order._id),
      customerId: String(order.customer),
    }),
  );

  tasks.push(
    sendNotification({
      channel: "WHATSAPP",
      event,
      recipient: order.shippingAddress.mobile,
      message: template.message,
      orderId: String(order._id),
      customerId: String(order.customer),
    }),
  );

  if (customer?.email) {
    tasks.push(
      sendNotification({
        channel: "EMAIL",
        event,
        recipient: customer.email,
        subject: template.subject,
        message: template.message,
        orderId: String(order._id),
        customerId: String(order.customer),
      }),
    );
  }

  const result = await Promise.all(tasks);

  return result;
};

const sendOrderPlacedNotification = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return sendOrderNotificationToCustomer(
    orderId,
    "ORDER_PLACED",
    NotificationTemplates.orderPlaced(order),
  );
};

const sendPaymentSuccessNotification = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return sendOrderNotificationToCustomer(
    orderId,
    "PAYMENT_SUCCESS",
    NotificationTemplates.paymentSuccess(order),
  );
};

const sendPaymentFailedNotification = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return sendOrderNotificationToCustomer(
    orderId,
    "PAYMENT_FAILED",
    NotificationTemplates.paymentFailed(order),
  );
};

const sendCourierBookedNotification = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return sendOrderNotificationToCustomer(
    orderId,
    "COURIER_BOOKED",
    NotificationTemplates.courierBooked(order),
  );
};

const sendOrderStatusUpdatedNotification = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const event =
    order.orderStatus === "DELIVERED"
      ? "ORDER_DELIVERED"
      : order.orderStatus === "RETURNED"
        ? "ORDER_RETURNED"
        : "ORDER_STATUS_UPDATED";

  return sendOrderNotificationToCustomer(
    orderId,
    event,
    NotificationTemplates.orderStatusUpdated(order),
  );
};

const sendCustomNotification = async (payload: TSendNotificationPayload) => {
  return sendNotification({
    ...payload,
    event: "CUSTOM",
  });
};

const getNotificationLogs = async (query: {
  channel?: TNotificationChannel;
  event?: TNotificationEvent;
  status?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.channel) {
    filter.channel = query.channel;
  }

  if (query.event) {
    filter.event = query.event;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [logs, total] = await Promise.all([
    NotificationLog.find(filter)
      .populate("order", "orderNumber orderStatus paymentStatus totalPayable")
      .populate("customer", "name mobile email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    NotificationLog.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: logs,
  };
};

export const NotificationService = {
  sendNotification,
  sendOrderPlacedNotification,
  sendPaymentSuccessNotification,
  sendPaymentFailedNotification,
  sendCourierBookedNotification,
  sendOrderStatusUpdatedNotification,
  sendCustomNotification,
  getNotificationLogs,
};
