import { FilterQuery, Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js";

import { Review } from "./review.model.js";
import { IReview, TReviewStatus } from "./review.interface.js";

type TCreateReviewPayload = {
  orderId: string;
  productId: string;
  variantId?: string;
  rating: number;
  comment?: string;
  images?: string[];
};

const recalculateProductRating = async (productId: string) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: new Types.ObjectId(productId),
        status: "APPROVED",
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: {
          $avg: "$rating",
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating = result.length
    ? Number(result[0].averageRating.toFixed(1))
    : 0;

  const reviewCount = result.length ? result[0].reviewCount : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    reviewCount,
  });

  return {
    averageRating,
    reviewCount,
  };
};

const createReview = async (userId: string, payload: TCreateReviewPayload) => {
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
      "You can review only delivered orders",
    );
  }

  const orderedItem = order.items.find((item) => {
    const productMatched = String(item.product) === payload.productId;

    const variantMatched = payload.variantId
      ? String(item.variantId) === payload.variantId
      : true;

    return productMatched && variantMatched;
  });

  if (!orderedItem) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This product was not found in your delivered order",
    );
  }

  const product = await Product.findById(payload.productId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const existingReview = await Review.findOne({
    customer: userId,
    product: payload.productId,
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this product",
    );
  }

  const review = await Review.create({
    customer: userId,
    product: payload.productId,
    order: payload.orderId,
    variantId: payload.variantId,
    rating: payload.rating,
    comment: payload.comment,
    images: payload.images || [],
    status: "PENDING",
  });

  return review;
};

const getProductReviews = async (
  productId: string,
  query: {
    page?: string;
    limit?: string;
  },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IReview> = {
    product: productId,
    status: "APPROVED",
  };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

const getMyReviews = async (userId: string) => {
  const reviews = await Review.find({
    customer: userId,
  })
    .populate("product", "name slug images averageRating reviewCount")
    .populate("order", "orderNumber orderStatus")
    .sort({ createdAt: -1 });

  return reviews;
};

const getAllReviewsForAdmin = async (query: {
  status?: TReviewStatus;
  productId?: string;
  customerId?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IReview> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.productId) {
    filter.product = query.productId;
  }

  if (query.customerId) {
    filter.customer = query.customerId;
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("customer", "name mobile email")
      .populate("product", "name slug images")
      .populate("order", "orderNumber orderStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: reviews,
  };
};

const updateReviewStatus = async (
  reviewId: string,
  adminId: string,
  payload: {
    status: "APPROVED" | "HIDDEN";
    adminNote?: string;
  },
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  review.status = payload.status;
  review.adminNote = payload.adminNote;
  review.approvedBy =
    payload.status === "APPROVED" ? new Types.ObjectId(adminId) : undefined;
  review.approvedAt = payload.status === "APPROVED" ? new Date() : undefined;

  await review.save();

  await recalculateProductRating(String(review.product));

  return review;
};

const hideReview = async (
  reviewId: string,
  adminId: string,
  adminNote?: string,
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  review.status = "HIDDEN";
  review.adminNote = adminNote || "Hidden by admin";
  review.approvedBy = new Types.ObjectId(adminId);

  await review.save();

  await recalculateProductRating(String(review.product));

  return review;
};

export const ReviewService = {
  createReview,
  getProductReviews,
  getMyReviews,
  getAllReviewsForAdmin,
  updateReviewStatus,
  hideReview,
  recalculateProductRating,
};
