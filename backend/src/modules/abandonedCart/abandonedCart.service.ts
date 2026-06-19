import { Types } from "mongoose";

import { Cart } from "../cart/cart.model.js";
import { User } from "../user/user.model.js";
import { Coupon } from "../coupon/coupon.model.js";
import { NotificationService } from "../notification/notification.service.js";

import { AbandonedCartLog } from "./abandonedCart.model.js";

const ABANDONED_AFTER_HOURS = 6;
const REMINDER_COOLDOWN_HOURS = 24;
const RECOVERY_COUPON_AMOUNT = 100;
const RECOVERY_COUPON_MIN_ORDER = 800;
const RECOVERY_COUPON_VALID_HOURS = 48;

const generateRecoveryCouponCode = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CART${random}`;
};

const createRecoveryCoupon = async () => {
  const code = generateRecoveryCouponCode();

  const now = new Date();
  const endDate = new Date(
    Date.now() + RECOVERY_COUPON_VALID_HOURS * 60 * 60 * 1000,
  );

  const coupon = await Coupon.create({
    code,
    title: "Abandoned Cart Recovery Coupon",
    description: "Auto generated coupon for abandoned cart recovery",
    discountType: "FIXED",
    discountValue: RECOVERY_COUPON_AMOUNT,
    minOrderAmount: RECOVERY_COUPON_MIN_ORDER,
    startDate: now,
    endDate,
    usageLimit: 1,
    perCustomerLimit: 1,
    scope: "ALL_PRODUCTS",
    status: "ACTIVE",
  });

  return coupon;
};

const buildRecoveryMessage = (payload: {
  name: string;
  totalItems: number;
  subtotal: number;
  couponCode?: string;
}) => {
  return (
    `Dear ${payload.name},\n\n` +
    `You left ${payload.totalItems} item(s) in your cart.\n` +
    `Cart Total: ৳${payload.subtotal}\n` +
    (payload.couponCode
      ? `Use coupon ${payload.couponCode} to get ৳${RECOVERY_COUPON_AMOUNT} off.\n`
      : "") +
    `Complete your order before the items go out of stock.\n\n` +
    `Thank you.`
  );
};

const getAbandonedCarts = async () => {
  const abandonedBefore = new Date(
    Date.now() - ABANDONED_AFTER_HOURS * 60 * 60 * 1000,
  );

  const carts = await Cart.find({
    "items.0": {
      $exists: true,
    },
    updatedAt: {
      $lte: abandonedBefore,
    },
  }).populate("user", "name mobile email status isMobileVerified");

  return carts;
};

const sendRecoveryForCart = async (cart: any) => {
  const customer = cart.user;

  if (!customer || customer.status !== "ACTIVE" || !customer.isMobileVerified) {
    const log = await AbandonedCartLog.create({
      customer: customer?._id || new Types.ObjectId(),
      cart: cart._id,
      cartSubtotal: cart.subtotal,
      totalItems: cart.totalItems,
      message: "Skipped because customer is inactive or unverified",
      status: "SKIPPED",
      sentChannels: [],
    });

    return log;
  }

  const cooldownAfter = new Date(
    Date.now() - REMINDER_COOLDOWN_HOURS * 60 * 60 * 1000,
  );

  const recentReminder = await AbandonedCartLog.findOne({
    customer: customer._id,
    cart: cart._id,
    createdAt: {
      $gte: cooldownAfter,
    },
  });

  if (recentReminder) {
    return recentReminder;
  }

  const coupon = await createRecoveryCoupon();

  const message = buildRecoveryMessage({
    name: customer.name,
    totalItems: cart.totalItems,
    subtotal: cart.subtotal,
    couponCode: coupon.code,
  });

  const sentChannels: string[] = [];

  try {
    await NotificationService.sendNotification({
      channel: "SMS",
      event: "ABANDONED_CART_RECOVERY",
      recipient: customer.mobile,
      message,
      customerId: String(customer._id),
    });

    sentChannels.push("SMS");

    await NotificationService.sendNotification({
      channel: "WHATSAPP",
      event: "ABANDONED_CART_RECOVERY",
      recipient: customer.mobile,
      message,
      customerId: String(customer._id),
    });

    sentChannels.push("WHATSAPP");

    if (customer.email) {
      await NotificationService.sendNotification({
        channel: "EMAIL",
        event: "ABANDONED_CART_RECOVERY",
        recipient: customer.email,
        subject: "You left items in your cart",
        message,
        customerId: String(customer._id),
      });

      sentChannels.push("EMAIL");
    }

    const log = await AbandonedCartLog.create({
      customer: customer._id,
      cart: cart._id,
      cartSubtotal: cart.subtotal,
      totalItems: cart.totalItems,
      couponCode: coupon.code,
      message,
      status: "SENT",
      sentChannels,
      sentAt: new Date(),
    });

    return log;
  } catch (error: any) {
    const log = await AbandonedCartLog.create({
      customer: customer._id,
      cart: cart._id,
      cartSubtotal: cart.subtotal,
      totalItems: cart.totalItems,
      couponCode: coupon.code,
      message,
      status: "FAILED",
      sentChannels,
      errorMessage: error.message || "Recovery notification failed",
    });

    return log;
  }
};

const runAbandonedCartRecovery = async () => {
  const carts = await getAbandonedCarts();

  const logs = [];

  for (const cart of carts) {
    const log = await sendRecoveryForCart(cart);
    logs.push(log);
  }

  return {
    totalDetected: carts.length,
    totalProcessed: logs.length,
    logs,
  };
};

const getAbandonedCartLogs = async (query: {
  status?: string;
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

  const [logs, total] = await Promise.all([
    AbandonedCartLog.find(filter)
      .populate("customer", "name mobile email")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    AbandonedCartLog.countDocuments(filter),
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

export const AbandonedCartService = {
  runAbandonedCartRecovery,
  getAbandonedCartLogs,
};
