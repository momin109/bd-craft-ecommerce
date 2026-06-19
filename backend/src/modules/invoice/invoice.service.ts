import fs from "fs";
import path from "path";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { env } from "../../config/env.js";

import { Order } from "../order/order.model.js";
import { User } from "../user/user.model.js";
import { NotificationService } from "../notification/notification.service.js";

import { Invoice } from "./invoice.model.js";
import { generateInvoicePdf } from "./invoice.generator.js";

const getInvoiceStoragePath = (invoiceNumber: string) => {
  return path.join(
    process.cwd(),
    "storage",
    "invoices",
    `${invoiceNumber}.pdf`,
  );
};

const getInvoicePublicUrl = (invoiceNumber: string) => {
  return `${env.invoice.publicBaseUrl}/api/v1/invoices/download/${invoiceNumber}`;
};

const generateInvoiceForOrder = async (
  orderId: string,
  options?: {
    forceRegenerate?: boolean;
  },
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const existingInvoice = await Invoice.findOne({
    order: order._id,
  });

  if (existingInvoice && !options?.forceRegenerate) {
    return existingInvoice;
  }

  const invoiceNumber = order.invoiceNumber;
  const pdfPath = getInvoiceStoragePath(invoiceNumber);
  const pdfUrl = getInvoicePublicUrl(invoiceNumber);

  await generateInvoicePdf(order, pdfPath);

  if (existingInvoice) {
    existingInvoice.pdfPath = pdfPath;
    existingInvoice.pdfUrl = pdfUrl;
    existingInvoice.subtotal = order.subtotal;
    existingInvoice.shippingCharge = order.shippingCharge;
    existingInvoice.discount = order.discount;
    existingInvoice.totalPayable = order.totalPayable;
    existingInvoice.paymentMethod = order.paymentMethod;
    existingInvoice.paymentStatus = order.paymentStatus;
    existingInvoice.orderStatus = order.orderStatus;
    existingInvoice.status = "GENERATED";
    existingInvoice.errorMessage = undefined;

    await existingInvoice.save();
    return existingInvoice;
  }

  const invoice = await Invoice.create({
    order: order._id,
    customer: order.customer,

    orderNumber: order.orderNumber,
    invoiceNumber,

    pdfPath,
    pdfUrl,

    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    discount: order.discount,
    totalPayable: order.totalPayable,

    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,

    status: "GENERATED",
  });

  return invoice;
};

const emailInvoiceToCustomer = async (
  orderId: string,
  options?: {
    forceRegenerate?: boolean;
  },
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const customer = await User.findById(order.customer);

  if (!customer?.email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Customer email not found");
  }

  const invoice = await generateInvoiceForOrder(orderId, {
    forceRegenerate: options?.forceRegenerate,
  });

  if (!fs.existsSync(invoice.pdfPath)) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice PDF file not found");
  }

  const message =
    `Dear ${order.shippingAddress.fullName},\n\n` +
    `Your invoice is attached with this email.\n\n` +
    `Order Number: ${order.orderNumber}\n` +
    `Invoice Number: ${order.invoiceNumber}\n` +
    `Total Payable: ৳${order.totalPayable}\n` +
    `Payment Status: ${order.paymentStatus}\n\n` +
    `Thank you for shopping with us.`;

  const log = await NotificationService.sendNotification({
    channel: "EMAIL",
    event: "CUSTOM",
    recipient: customer.email,
    subject: `Invoice for order ${order.orderNumber}`,
    message,
    orderId: String(order._id),
    customerId: String(order.customer),
    attachments: [
      {
        filename: `${order.invoiceNumber}.pdf`,
        path: invoice.pdfPath,
        contentType: "application/pdf",
      },
    ],
  });

  if (log.status === "SENT") {
    invoice.status = "EMAILED";
    invoice.emailSentAt = new Date();
    invoice.errorMessage = undefined;
  } else if (log.status === "FAILED") {
    invoice.status = "FAILED";
    invoice.errorMessage = log.errorMessage;
  }

  await invoice.save();

  return {
    invoice,
    emailLog: log,
  };
};

const getInvoiceByOrderForCustomer = async (
  userId: string,
  orderId: string,
) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: userId,
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const invoice = await generateInvoiceForOrder(String(order._id));

  return invoice;
};

const getInvoiceByNumber = async (invoiceNumber: string) => {
  const invoice = await Invoice.findOne({
    invoiceNumber,
  });

  if (!invoice) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice not found");
  }

  if (!fs.existsSync(invoice.pdfPath)) {
    throw new AppError(httpStatus.NOT_FOUND, "Invoice PDF not found");
  }

  return invoice;
};

const getAllInvoicesForAdmin = async (query: {
  status?: string;
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
        orderNumber: new RegExp(query.search, "i"),
      },
      {
        invoiceNumber: new RegExp(query.search, "i"),
      },
    ];
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate("customer", "name mobile email")
      .populate("order", "orderNumber orderStatus paymentStatus totalPayable")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: invoices,
  };
};

export const InvoiceService = {
  generateInvoiceForOrder,
  emailInvoiceToCustomer,
  getInvoiceByOrderForCustomer,
  getInvoiceByNumber,
  getAllInvoicesForAdmin,
};
