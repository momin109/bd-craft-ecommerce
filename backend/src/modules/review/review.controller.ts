import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { ReviewService } from "./review.service.js";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted successfully. Waiting for admin approval.",
    data: result,
  });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getProductReviews(
    req.params.productId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getMyReviews(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My reviews retrieved successfully",
    data: result,
  });
});

const getAllReviewsForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReviewsForAdmin(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const updateReviewStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReviewStatus(
    req.params.reviewId,
    req.user!.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review status updated successfully",
    data: result,
  });
});

const hideReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.hideReview(
    req.params.reviewId,
    req.user!.userId,
    req.body?.adminNote,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review hidden successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getProductReviews,
  getMyReviews,
  getAllReviewsForAdmin,
  updateReviewStatus,
  hideReview,
};
