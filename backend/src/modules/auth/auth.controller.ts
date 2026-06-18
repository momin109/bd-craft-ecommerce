import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { env } from "../../config/env.js";
import { AuthService } from "./auth.service.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Registration successful. Please verify OTP.",
    data: result,
  });
});

const verifyMobileOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyMobileOtp(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Mobile verified successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

export const AuthController = {
  registerUser,
  verifyMobileOtp,
  loginUser,
};
