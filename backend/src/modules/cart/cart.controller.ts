import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { CartService } from "./cart.service.js";

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getMyCart(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.addToCart(req.user!.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product added to cart successfully",
    data: result,
  });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.updateCartItem(
    req.user!.userId,
    req.params.itemId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.removeCartItem(
    req.user!.userId,
    req.params.itemId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item removed successfully",
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.clearCart(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart cleared successfully",
    data: result,
  });
});

export const CartController = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
