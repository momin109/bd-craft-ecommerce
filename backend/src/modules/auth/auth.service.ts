import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { User } from "../user/user.model.js";
import { Otp } from "../otp/otp.model.js";
import { ReferralService } from "../referral/referral.service.js";

import {
  compareOtp,
  generateOtpCode,
  getOtpExpiryDate,
  hashOtp,
} from "../otp/otp.utils.js";
import {
  createAccessToken,
  createRefreshToken,
  normalizeBangladeshiMobile,
} from "./auth.utils.js";

type TRegisterPayload = {
  name: string;
  mobile: string;
  email?: string;
  password: string;
  referralCode?: string;
};

type TVerifyOtpPayload = {
  mobile: string;
  otp: string;
};

type TLoginPayload = {
  mobile: string;
  password: string;
};

const registerUser = async (payload: TRegisterPayload) => {
  const mobile = normalizeBangladeshiMobile(payload.mobile);

  const existingUser = await User.findOne({ mobile });

  if (existingUser?.isMobileVerified) {
    throw new AppError(httpStatus.CONFLICT, "Mobile number already registered");
  }

  let user = existingUser;
  let isNewUser = false;

  if (!user) {
    user = await User.create({
      name: payload.name,
      mobile,
      email: payload.email,
      password: payload.password,
      role: "CUSTOMER",
    });
  }

  const otp = generateOtpCode();
  const otpHash = await hashOtp(otp);

  await Otp.deleteMany({
    mobile,
    purpose: "REGISTRATION",
    usedAt: { $exists: false },
  });

  await Otp.create({
    mobile,
    otpHash,
    purpose: "REGISTRATION",
    expiresAt: getOtpExpiryDate(5),
  });

  if (!user) {
    user = await User.create({
      name: payload.name,
      mobile,
      email: payload.email,
      password: payload.password,
      role: "CUSTOMER",
    });

    isNewUser = true;
  }

  if (isNewUser) {
    await ReferralService.applyReferralOnRegistration(
      String(user._id),
      payload.referralCode,
    );
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      isMobileVerified: user.isMobileVerified,
    },

    // Development only.
    // Production এ এই OTP response এ দেওয়া যাবে না।
    otpForDevelopment: otp,
  };
};

const verifyMobileOtp = async (payload: TVerifyOtpPayload) => {
  const mobile = normalizeBangladeshiMobile(payload.mobile);

  const user = await User.findOne({ mobile });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isMobileVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Mobile already verified");
  }

  const otpRecord = await Otp.findOne({
    mobile,
    purpose: "REGISTRATION",
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP expired or not found");
  }

  const isOtpMatched = await compareOtp(payload.otp, otpRecord.otpHash);

  if (!isOtpMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  otpRecord.usedAt = new Date();
  await otpRecord.save();

  user.isMobileVerified = true;
  await user.save();

  return {
    id: user._id,
    name: user.name,
    mobile: user.mobile,
    role: user.role,
    isMobileVerified: user.isMobileVerified,
  };
};

const loginUser = async (payload: TLoginPayload) => {
  const mobile = normalizeBangladeshiMobile(payload.mobile);

  const user = await User.findOne({ mobile }).select("+password");

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid mobile or password");
  }

  const isPasswordMatched = await user.comparePassword(payload.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid mobile or password");
  }

  if (!user.isMobileVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Please verify your mobile number",
    );
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is not active");
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
    mobile: user.mobile,
  };

  const accessToken = createAccessToken(jwtPayload);
  const refreshToken = createRefreshToken(jwtPayload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      isMobileVerified: user.isMobileVerified,
      orderStats: user.orderStats,
      codAllowed: user.codAllowed,
    },
  };
};

export const AuthService = {
  registerUser,
  verifyMobileOtp,
  loginUser,
};
