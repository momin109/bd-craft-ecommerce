import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { CouponService } from "./coupon.service.js";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCoupon(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getAllCoupons(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupons retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.updateCoupon(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon updated successfully",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.deleteCoupon(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
});

const applyCouponToCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.applyCouponToCart(
    req.user!.userId,
    req.body.code,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon applied successfully",
    data: result,
  });
});

export const CouponController = {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCouponToCart,
};
