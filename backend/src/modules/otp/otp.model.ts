import { Schema, model } from "mongoose";

export type TOtpPurpose = "REGISTRATION" | "LOGIN" | "PASSWORD_RESET";

export interface IOtp {
  mobile: string;
  otpHash: string;
  purpose: TOtpPurpose;
  expiresAt: Date;
  usedAt?: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    mobile: {
      type: String,
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["REGISTRATION", "LOGIN", "PASSWORD_RESET"],
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = model<IOtp>("Otp", otpSchema);
