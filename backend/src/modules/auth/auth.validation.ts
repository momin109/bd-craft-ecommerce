import { z } from "zod";

const bdMobileRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const registerUserValidation = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z
      .string()
      .regex(bdMobileRegex, "Invalid Bangladeshi mobile number"),
    email: z.string().email("Invalid email").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    referralCode: z.string().optional(),
  }),
});

export const verifyOtpValidation = z.object({
  body: z.object({
    mobile: z
      .string()
      .regex(bdMobileRegex, "Invalid Bangladeshi mobile number"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const loginValidation = z.object({
  body: z.object({
    mobile: z
      .string()
      .regex(bdMobileRegex, "Invalid Bangladeshi mobile number"),
    password: z.string().min(1, "Password is required"),
  }),
});
