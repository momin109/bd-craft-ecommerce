import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export const generateOtpCode = (): string => {
  return randomInt(100000, 999999).toString();
};

export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

export const compareOtp = async (
  plainOtp: string,
  otpHash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainOtp, otpHash);
};

export const getOtpExpiryDate = (minutes = 5): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
