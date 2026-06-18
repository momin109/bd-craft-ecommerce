import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Cart } from "../cart/cart.model.js";
import { Product } from "../product/product.model.js";

import { Coupon, CouponRedemption } from "./coupon.model.js";
import { ICoupon } from "./coupon.interface.js";

type TDiscountItem = {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  itemTotal: number;
};

type TCalculateDiscountPayload = {
  userId: string;
  couponCode?: string;
  subtotal: number;
  items: TDiscountItem[];
};

type TRecordCouponUsagePayload = {
  couponId: string;
  code: string;
  customerId: string;
  orderId: string;
  discountAmount: number;
};

const normalizeCouponCode = (code: string) => {
  return code.trim().toUpperCase();
};

const validateCouponBase = async (
  coupon: ICoupon,
  userId: string,
  subtotal: number,
) => {
  const now = new Date();

  if (coupon.status !== "ACTIVE") {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon is inactive");
  }

  if (coupon.startDate > now) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon is not started yet");
  }

  if (coupon.endDate < now) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon has expired");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon usage limit exceeded");
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Minimum order amount should be ৳${coupon.minOrderAmount}`,
    );
  }

  const customerUsedCount = await CouponRedemption.countDocuments({
    coupon: coupon._id,
    customer: userId,
  });

  if (customerUsedCount >= coupon.perCustomerLimit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already used this coupon",
    );
  }
};

const getEligibleSubtotal = async (coupon: ICoupon, items: TDiscountItem[]) => {
  if (coupon.scope === "ALL_PRODUCTS" && coupon.excludedProducts.length === 0) {
    return items.reduce((sum, item) => sum + item.itemTotal, 0);
  }

  const productIds = items.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).select("_id category");

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  let eligibleSubtotal = 0;

  for (const item of items) {
    const productId = String(item.product);
    const product = productMap.get(productId);

    if (!product) {
      continue;
    }

    const isExcluded = coupon.excludedProducts.some((id) => {
      return String(id) === productId;
    });

    if (isExcluded) {
      continue;
    }

    if (coupon.scope === "ALL_PRODUCTS") {
      eligibleSubtotal += item.itemTotal;
      continue;
    }

    if (coupon.scope === "SPECIFIC_PRODUCTS") {
      const isApplicableProduct = coupon.applicableProducts.some((id) => {
        return String(id) === productId;
      });

      if (isApplicableProduct) {
        eligibleSubtotal += item.itemTotal;
      }

      continue;
    }

    if (coupon.scope === "SPECIFIC_CATEGORIES") {
      const isApplicableCategory = coupon.applicableCategories.some((id) => {
        return String(id) === String(product.category);
      });

      if (isApplicableCategory) {
        eligibleSubtotal += item.itemTotal;
      }
    }
  }

  return eligibleSubtotal;
};

const calculateDiscountAmount = (coupon: ICoupon, eligibleSubtotal: number) => {
  if (eligibleSubtotal <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Coupon is not applicable for selected products",
    );
  }

  let discountAmount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = Math.floor(
      (eligibleSubtotal * coupon.discountValue) / 100,
    );

    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  }

  if (coupon.discountType === "FIXED") {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, eligibleSubtotal);

  return discountAmount;
};

const calculateCouponDiscount = async (payload: TCalculateDiscountPayload) => {
  if (!payload.couponCode) {
    return {
      coupon: null,
      couponCode: null,
      discountAmount: 0,
    };
  }

  const code = normalizeCouponCode(payload.couponCode);

  const coupon = await Coupon.findOne({
    code,
  });

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Invalid coupon code");
  }

  await validateCouponBase(coupon, payload.userId, payload.subtotal);

  const rawEligibleSubtotal = await getEligibleSubtotal(coupon, payload.items);
  const eligibleSubtotal = Math.min(rawEligibleSubtotal, payload.subtotal);

  const discountAmount = calculateDiscountAmount(coupon, eligibleSubtotal);

  return {
    coupon,
    couponCode: coupon.code,
    discountAmount,
    eligibleSubtotal,
  };
};

const applyCouponToCart = async (userId: string, code: string) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cart is empty");
  }

  const result = await calculateCouponDiscount({
    userId,
    couponCode: code,
    subtotal: cart.subtotal,
    items: cart.items.map((item) => ({
      product: item.product,
      variantId: item.variantId,
      quantity: item.quantity,
      itemTotal: item.itemTotal,
    })),
  });

  return {
    couponCode: result.couponCode,
    subtotal: cart.subtotal,
    discountAmount: result.discountAmount,
    totalAfterDiscount: cart.subtotal - result.discountAmount,
  };
};

const recordCouponUsage = async (payload: TRecordCouponUsagePayload) => {
  if (payload.discountAmount <= 0) {
    return null;
  }

  const redemption = await CouponRedemption.create({
    coupon: payload.couponId,
    code: normalizeCouponCode(payload.code),
    customer: payload.customerId,
    order: payload.orderId,
    discountAmount: payload.discountAmount,
    usedAt: new Date(),
  });

  await Coupon.findByIdAndUpdate(payload.couponId, {
    $inc: {
      usedCount: 1,
    },
  });

  return redemption;
};

const createCoupon = async (adminId: string, payload: Partial<ICoupon>) => {
  const code = normalizeCouponCode(String(payload.code));

  const existing = await Coupon.findOne({
    code,
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "Coupon code already exists");
  }

  if (
    payload.discountType === "PERCENTAGE" &&
    Number(payload.discountValue) > 100
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Percentage discount cannot be more than 100",
    );
  }

  if (
    new Date(String(payload.endDate)) <= new Date(String(payload.startDate))
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be greater than start date",
    );
  }

  const coupon = await Coupon.create({
    ...payload,
    code,
    createdBy: adminId,
  });

  return coupon;
};

const getAllCoupons = async (query: {
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      {
        code: new RegExp(query.search, "i"),
      },
      {
        title: new RegExp(query.search, "i"),
      },
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate("createdBy", "name mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Coupon.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: coupons,
  };
};

const updateCoupon = async (id: string, payload: Partial<ICoupon>) => {
  const updateData = {
    ...payload,
  };

  delete updateData.code;
  delete updateData.usedCount;
  delete updateData.createdBy;

  const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  return coupon;
};

const deleteCoupon = async (id: string) => {
  const coupon = await Coupon.findByIdAndUpdate(
    id,
    {
      status: "INACTIVE",
    },
    {
      new: true,
    },
  );

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  return coupon;
};

export const CouponService = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCouponToCart,
  calculateCouponDiscount,
  recordCouponUsage,
};
