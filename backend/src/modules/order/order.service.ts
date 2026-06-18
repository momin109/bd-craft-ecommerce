import crypto from "crypto";
import { FilterQuery, Types } from "mongoose";
import { NotificationService } from "../notification/notification.service.js";

import { CouponService } from "../coupon/coupon.service.js";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import {
  generateInvoiceNumber,
  generateOrderNumber,
} from "../../utils/generateOrderNumber.js";

import { Cart } from "../cart/cart.model.js";
import { Product } from "../product/product.model.js";
import { User } from "../user/user.model.js";
import { normalizeBangladeshiMobile } from "../auth/auth.utils.js";

import { Order } from "./order.model.js";
import {
  IOrder,
  IOrderItem,
  IShippingAddress,
  TOrderStatus,
  TPaymentMethod,
} from "./order.interface.js";

import { OfferService } from "../offer/offer.service.js";

const COD_SUCCESS_RATE_LIMIT = 60;
const MIN_ORDERS_FOR_COD_RESTRICTION = 3;
const DUPLICATE_ORDER_HOURS = 24;

// type TCheckoutPayload = {
//   shippingAddress: IShippingAddress;
//   paymentMethod: TPaymentMethod;
//   shippingCharge?: number;
//   discount?: number;
//   customerNote?: string;
// };

type TCheckoutPayload = {
  shippingAddress: IShippingAddress;
  paymentMethod: TPaymentMethod;
  shippingCharge?: number;
  couponCode?: string;
  customerNote?: string;
};

type TOrderQuery = {
  status?: TOrderStatus;
  paymentMethod?: TPaymentMethod;
  search?: string;
  page?: string;
  limit?: string;
};

const createOrderFingerprint = (
  mobile: string,
  items: {
    product: Types.ObjectId;
    variantId: Types.ObjectId;
    quantity: number;
  }[],
) => {
  const itemString = items
    .map((item) => {
      return `${String(item.product)}:${String(item.variantId)}:${item.quantity}`;
    })
    .sort()
    .join("|");

  return crypto
    .createHash("sha256")
    .update(`${mobile}|${itemString}`)
    .digest("hex");
};

const calculateUserSuccessRate = (user: any) => {
  const totalOrders = user.orderStats.totalOrders || 0;
  const deliveredOrders = user.orderStats.deliveredOrders || 0;

  if (totalOrders === 0) {
    return 100;
  }

  return Math.round((deliveredOrders / totalOrders) * 100);
};

const checkCodEligibility = (user: any) => {
  const totalOrders = user.orderStats.totalOrders || 0;
  const successRate = user.orderStats.successRate ?? 100;

  if (!user.codAllowed) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "COD is restricted for this customer",
    );
  }

  if (
    totalOrders >= MIN_ORDERS_FOR_COD_RESTRICTION &&
    successRate < COD_SUCCESS_RATE_LIMIT
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `COD is restricted because customer success rate is ${successRate}%`,
    );
  }
};

const checkDuplicateOrder = async (
  customerId: string,
  mobile: string,
  orderFingerprint: string,
) => {
  const duplicateAfter = new Date(
    Date.now() - DUPLICATE_ORDER_HOURS * 60 * 60 * 1000,
  );

  const existingOrder = await Order.findOne({
    customer: customerId,
    "shippingAddress.mobile": mobile,
    orderFingerprint,
    orderStatus: {
      $in: ["PENDING", "APPROVED", "PROCESSING"],
    },
    createdAt: {
      $gte: duplicateAfter,
    },
  });

  if (existingOrder) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Duplicate order detected. Please check your previous order.",
    );
  }
};

const buildOrderItemsFromCart = async (cart: any) => {
  const orderItems: IOrderItem[] = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);

    if (!product || product.status !== "ACTIVE") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Product ${cartItem.name} is not available`,
      );
    }

    const variant = product.variants.find((item) => {
      return String(item._id) === String(cartItem.variantId) && item.isActive;
    });

    if (!variant) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Variant ${cartItem.sku} is not available`,
      );
    }

    if (variant.stock < cartItem.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Only ${variant.stock} item(s) available for ${product.name}`,
      );
    }

    const unitPrice = variant.sellingPrice;
    const purchasePrice = variant.purchasePrice;
    const itemTotal = unitPrice * cartItem.quantity;
    const profit = (unitPrice - purchasePrice) * cartItem.quantity;

    orderItems.push({
      product: product._id,
      variantId: new Types.ObjectId(String(variant._id)),
      sku: variant.sku,
      name: product.name,
      image: product.images?.[0],
      size: variant.size,
      color: variant.color,
      unitPrice,
      quantity: cartItem.quantity,
      itemTotal,
      purchasePrice,
      profit,
    });
  }

  return orderItems;
};

const checkoutFromCart = async (userId: string, payload: TCheckoutPayload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
  }

  if (!user.isMobileVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Please verify your mobile number before placing order",
    );
  }

  if (payload.paymentMethod === "COD") {
    checkCodEligibility(user);
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  const normalizedMobile = normalizeBangladeshiMobile(
    payload.shippingAddress.mobile,
  );

  const shippingAddress = {
    ...payload.shippingAddress,
    mobile: normalizedMobile,
  };

  const orderItems = await buildOrderItemsFromCart(cart);

  const orderFingerprint = createOrderFingerprint(normalizedMobile, orderItems);

  await checkDuplicateOrder(userId, normalizedMobile, orderFingerprint);

  // const subtotal = orderItems.reduce((sum, item) => sum + item.itemTotal, 0);
  // const shippingCharge = payload.shippingCharge || 0;
  // const discount = payload.discount || 0;
  // const totalPayable = subtotal + shippingCharge - discount;

  const subtotal = orderItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const shippingCharge = payload.shippingCharge || 0;

  const offerResult = await OfferService.calculateOfferDiscount({
    userId,
    subtotal,
    items: orderItems.map((item) => ({
      product: item.product,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotal: item.itemTotal,
    })),
  });

  const offerDiscount = offerResult.offerDiscount;
  const subtotalAfterOffer = subtotal - offerDiscount;

  const couponResult = await CouponService.calculateCouponDiscount({
    userId,
    couponCode: payload.couponCode,
    subtotal: subtotalAfterOffer,
    items: orderItems.map((item) => ({
      product: item.product,
      variantId: item.variantId,
      quantity: item.quantity,
      itemTotal: item.itemTotal,
    })),
  });

  const couponDiscount = couponResult.discountAmount;
  const discount = offerDiscount + couponDiscount;

  const totalPayable = subtotal + shippingCharge - discount;

  if (totalPayable < 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order amount");
  }

  const totalPurchaseCost = orderItems.reduce((sum, item) => {
    return sum + item.purchasePrice * item.quantity;
  }, 0);

  const totalProfit = totalPayable - shippingCharge - totalPurchaseCost;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    invoiceNumber: generateInvoiceNumber(),

    customer: userId,

    items: orderItems,

    shippingAddress,

    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === "COD" ? "UNPAID" : "UNPAID",

    orderStatus: "PENDING",
    statusLogs: [
      {
        status: "PENDING",
        note: "Order placed by customer",
        changedBy: userId,
        changedAt: new Date(),
      },
    ],

    subtotal,
    shippingCharge,

    couponDiscount,
    offerDiscount,
    discount,

    coupon: couponResult.coupon?._id,
    couponCode: couponResult.couponCode,

    appliedOffers: offerResult.appliedOffers,

    totalPayable,

    totalPurchaseCost,
    totalProfit,

    courier: {
      provider: "NONE",
    },

    isStockDeducted: false,
    orderFingerprint,

    customerNote: payload.customerNote,
  });

  if (couponResult.coupon && couponResult.discountAmount > 0) {
    await CouponService.recordCouponUsage({
      couponId: String(couponResult.coupon._id),
      code: couponResult.coupon.code,
      customerId: userId,
      orderId: String(order._id),
      discountAmount: couponResult.discountAmount,
    });
  }

  if (offerResult.appliedOffers.length > 0) {
    await OfferService.recordOfferUsage({
      customerId: userId,
      orderId: String(order._id),
      appliedOffers: offerResult.appliedOffers,
    });
  }

  cart.items = [];
  cart.totalItems = 0;
  cart.subtotal = 0;
  await cart.save();

  return order;
};

const deductOrderStock = async (order: IOrder) => {
  if (order.isStockDeducted) {
    return;
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Product not found for SKU ${item.sku}`,
      );
    }

    const variant = product.variants.find((variantItem) => {
      return String(variantItem._id) === String(item.variantId);
    });

    if (!variant) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Variant not found for SKU ${item.sku}`,
      );
    }

    if (variant.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for SKU ${item.sku}`,
      );
    }

    variant.stock -= item.quantity;

    product.totalStock = product.variants.reduce((sum, variantItem) => {
      return sum + Number(variantItem.stock || 0);
    }, 0);

    await product.save();
  }
};

const restoreOrderStock = async (order: IOrder) => {
  if (!order.isStockDeducted) {
    return;
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);

    if (!product) {
      continue;
    }

    const variant = product.variants.find((variantItem) => {
      return String(variantItem._id) === String(item.variantId);
    });

    if (!variant) {
      continue;
    }

    variant.stock += item.quantity;

    product.totalStock = product.variants.reduce((sum, variantItem) => {
      return sum + Number(variantItem.stock || 0);
    }, 0);

    await product.save();
  }
};

const updateCustomerOrderStats = async (
  customerId: Types.ObjectId,
  status: TOrderStatus,
) => {
  const user = await User.findById(customerId);

  if (!user) {
    return;
  }

  if (status === "DELIVERED") {
    user.orderStats.deliveredOrders += 1;
  }

  if (status === "RETURNED") {
    user.orderStats.returnedOrders += 1;
  }

  if (status === "CANCELLED") {
    user.orderStats.cancelledOrders += 1;
  }

  if (["DELIVERED", "RETURNED", "CANCELLED"].includes(status)) {
    user.orderStats.totalOrders += 1;
  }

  user.orderStats.successRate = calculateUserSuccessRate(user);

  if (
    user.orderStats.totalOrders >= MIN_ORDERS_FOR_COD_RESTRICTION &&
    user.orderStats.successRate < COD_SUCCESS_RATE_LIMIT
  ) {
    user.codAllowed = false;
  }

  await user.save();
};

const updateOrderStatus = async (
  orderId: string,
  adminId: string | null,
  payload: {
    status: TOrderStatus;
    note?: string;
  },
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const previousStatus = order.orderStatus;

  if (order.orderStatus === "CANCELLED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cancelled order cannot be updated",
    );
  }

  if (order.orderStatus === "RETURNED" && payload.status !== "RETURNED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Returned order cannot be updated",
    );
  }

  if (
    payload.status === "APPROVED" &&
    order.paymentMethod !== "COD" &&
    order.paymentStatus !== "PAID"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Online payment order cannot be approved before payment is completed",
    );
  }

  if (payload.status === "APPROVED") {
    await deductOrderStock(order);
    order.isStockDeducted = true;
  }

  if (payload.status === "CANCELLED") {
    await restoreOrderStock(order);
    order.isStockDeducted = false;

    await OfferService.releaseOfferUsageByOrder(String(order._id));
  }

  if (payload.status === "RETURNED") {
    await restoreOrderStock(order);
    order.isStockDeducted = false;
  }

  order.orderStatus = payload.status;

  order.statusLogs.push({
    status: payload.status,
    note: payload.note,
    changedBy: adminId ? new Types.ObjectId(adminId) : undefined,
    changedAt: new Date(),
  });

  await order.save();

  if (
    ["DELIVERED", "RETURNED", "CANCELLED"].includes(payload.status) &&
    previousStatus !== payload.status
  ) {
    await updateCustomerOrderStats(order.customer, payload.status);
  }

  if (
    ["SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"].includes(
      payload.status,
    ) &&
    previousStatus !== payload.status
  ) {
    NotificationService.sendOrderStatusUpdatedNotification(
      String(order._id),
    ).catch((error) => {
      console.error("Order status notification failed:", error);
    });
  }

  return order;
};

const updateOrderStatusBySystem = async (
  orderId: string,
  status: TOrderStatus,
  note?: string,
) => {
  return updateOrderStatus(orderId, null, {
    status,
    note,
  });
};

const getMyOrders = async (userId: string) => {
  const orders = await Order.find({ customer: userId })
    .sort({ createdAt: -1 })
    .populate("items.product", "name slug images");

  return orders;
};

const getMySingleOrder = async (userId: string, orderId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: userId,
  }).populate("items.product", "name slug images");

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

const trackOrder = async (orderNumber: string, mobile: string) => {
  const normalizedMobile = normalizeBangladeshiMobile(mobile);

  const order = await Order.findOne({
    orderNumber,
    "shippingAddress.mobile": normalizedMobile,
  }).select(
    "orderNumber invoiceNumber orderStatus paymentMethod paymentStatus courier statusLogs createdAt",
  );

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

const getAllOrdersForAdmin = async (query: TOrderQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IOrder> = {};

  if (query.status) {
    filter.orderStatus = query.status;
  }

  if (query.paymentMethod) {
    filter.paymentMethod = query.paymentMethod;
  }

  if (query.search) {
    filter.$or = [
      { orderNumber: new RegExp(query.search, "i") },
      { invoiceNumber: new RegExp(query.search, "i") },
      { "shippingAddress.mobile": new RegExp(query.search, "i") },
      { "shippingAddress.fullName": new RegExp(query.search, "i") },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customer", "name mobile email orderStats codAllowed")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: orders,
  };
};

const getSingleOrderForAdmin = async (orderId: string) => {
  const order = await Order.findById(orderId)
    .populate("customer", "name mobile email orderStats codAllowed")
    .populate("items.product", "name slug images");

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  return order;
};

export const OrderService = {
  checkoutFromCart,
  updateOrderStatus,
  updateOrderStatusBySystem,
  getMyOrders,
  getMySingleOrder,
  trackOrder,
  getAllOrdersForAdmin,
  getSingleOrderForAdmin,
};
