import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { User } from "../user/user.model.js";
import { Order } from "../order/order.model.js";
import { Coupon } from "../coupon/coupon.model.js";
import { NotificationService } from "../notification/notification.service.js";

import { Referral } from "./referral.model.js";
import {
  generateReferralCode,
  generateReferralRewardCouponCode,
} from "./referral.utils.js";

const REFERRAL_REWARD_AMOUNT = 100;
const REFERRAL_REWARD_MIN_ORDER = 700;
const REFERRAL_REWARD_VALID_DAYS = 30;

const createUniqueReferralCode = async (name?: string) => {
  let code = generateReferralCode(name);

  let exists = await User.findOne({
    referralCode: code,
  });

  while (exists) {
    code = generateReferralCode(name);
    exists = await User.findOne({
      referralCode: code,
    });
  }

  return code;
};

const ensureUserReferralCode = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.referralCode) {
    return user.referralCode;
  }

  const referralCode = await createUniqueReferralCode(user.name);

  user.referralCode = referralCode;
  await user.save();

  return referralCode;
};

const applyReferralOnRegistration = async (
  newUserId: string,
  referralCode?: string,
) => {
  const newUser = await User.findById(newUserId);

  if (!newUser) {
    throw new AppError(httpStatus.NOT_FOUND, "New user not found");
  }

  await ensureUserReferralCode(newUserId);

  if (!referralCode) {
    return null;
  }

  const normalizedCode = referralCode.trim().toUpperCase();

  const referrer = await User.findOne({
    referralCode: normalizedCode,
    status: "ACTIVE",
  });

  if (!referrer) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid referral code");
  }

  if (String(referrer._id) === newUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot use your own referral code",
    );
  }

  const existingReferral = await Referral.findOne({
    referredUser: newUserId,
  });

  if (existingReferral) {
    return existingReferral;
  }

  newUser.referredBy = normalizedCode;
  await newUser.save();

  referrer.referralStats.totalReferred += 1;
  await referrer.save();

  const referral = await Referral.create({
    referrer: referrer._id,
    referredUser: newUser._id,
    referralCode: normalizedCode,
    status: "REGISTERED",
    rewardAmount: REFERRAL_REWARD_AMOUNT,
  });

  return referral;
};

const createRewardCoupon = async () => {
  const code = generateReferralRewardCouponCode();

  const now = new Date();
  const endDate = new Date(
    Date.now() + REFERRAL_REWARD_VALID_DAYS * 24 * 60 * 60 * 1000,
  );

  const coupon = await Coupon.create({
    code,
    title: "Referral Reward Coupon",
    description: "Auto generated referral reward coupon",
    discountType: "FIXED",
    discountValue: REFERRAL_REWARD_AMOUNT,
    minOrderAmount: REFERRAL_REWARD_MIN_ORDER,
    startDate: now,
    endDate,
    usageLimit: 1,
    perCustomerLimit: 1,
    scope: "ALL_PRODUCTS",
    status: "ACTIVE",
  });

  return coupon;
};

const processReferralRewardForDeliveredOrder = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order || order.orderStatus !== "DELIVERED") {
    return null;
  }

  const referral = await Referral.findOne({
    referredUser: order.customer,
    status: {
      $in: ["REGISTERED", "FIRST_ORDER_DELIVERED"],
    },
  });

  if (!referral) {
    return null;
  }

  const previousDeliveredOrder = await Order.findOne({
    customer: order.customer,
    orderStatus: "DELIVERED",
    _id: {
      $ne: order._id,
    },
  });

  if (previousDeliveredOrder) {
    referral.status = "CANCELLED";
    await referral.save();
    return referral;
  }

  const rewardCoupon = await createRewardCoupon();

  referral.status = "REWARDED";
  referral.firstOrder = order._id;
  referral.rewardCouponCode = rewardCoupon.code;
  referral.rewardedAt = new Date();
  await referral.save();

  const referrer = await User.findById(referral.referrer);

  if (referrer) {
    referrer.referralStats.totalRewarded += 1;
    referrer.referralStats.totalRewardAmount += REFERRAL_REWARD_AMOUNT;
    await referrer.save();

    const message =
      `Congratulations ${referrer.name}!\n\n` +
      `Your referral reward is ready.\n` +
      `Reward Coupon: ${rewardCoupon.code}\n` +
      `Discount: ৳${REFERRAL_REWARD_AMOUNT}\n` +
      `Minimum Order: ৳${REFERRAL_REWARD_MIN_ORDER}\n\n` +
      `Thank you for referring your friend.`;

    await NotificationService.sendNotification({
      channel: "SMS",
      event: "REFERRAL_REWARD",
      recipient: referrer.mobile,
      message,
      customerId: String(referrer._id),
    });

    await NotificationService.sendNotification({
      channel: "WHATSAPP",
      event: "REFERRAL_REWARD",
      recipient: referrer.mobile,
      message,
      customerId: String(referrer._id),
    });

    if (referrer.email) {
      await NotificationService.sendNotification({
        channel: "EMAIL",
        event: "REFERRAL_REWARD",
        recipient: referrer.email,
        subject: "Your referral reward is ready",
        message,
        customerId: String(referrer._id),
      });
    }
  }

  return referral;
};

const getMyReferralDashboard = async (userId: string) => {
  const user = await User.findById(userId).select(
    "name mobile referralCode referralStats",
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const referralCode = await ensureUserReferralCode(userId);

  const referrals = await Referral.find({
    referrer: userId,
  })
    .populate("referredUser", "name mobile createdAt")
    .populate("firstOrder", "orderNumber totalPayable orderStatus")
    .sort({
      createdAt: -1,
    });

  return {
    referralCode,
    referralStats: user.referralStats,
    referrals,
  };
};

const getReferralReportForAdmin = async (query: {
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

  const [referrals, total] = await Promise.all([
    Referral.find(filter)
      .populate("referrer", "name mobile email referralStats")
      .populate("referredUser", "name mobile email")
      .populate("firstOrder", "orderNumber totalPayable orderStatus")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    Referral.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: referrals,
  };
};

export const ReferralService = {
  createUniqueReferralCode,
  ensureUserReferralCode,
  applyReferralOnRegistration,
  processReferralRewardForDeliveredOrder,
  getMyReferralDashboard,
  getReferralReportForAdmin,
};
