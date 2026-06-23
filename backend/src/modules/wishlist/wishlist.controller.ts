import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { WishlistService } from "./wishlist.service.js";

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.getMyWishlist(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wishlist retrieved successfully",
    data: result,
  });
});

const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.addToWishlist(
    req.user!.userId,
    req.params.productId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product added to wishlist successfully",
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.removeFromWishlist(
    req.user!.userId,
    req.params.productId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product removed from wishlist successfully",
    data: result,
  });
});

const checkWishlistProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.checkWishlistProduct(
    req.user!.userId,
    req.params.productId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wishlist status retrieved successfully",
    data: result,
  });
});

export const WishlistController = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistProduct,
};
