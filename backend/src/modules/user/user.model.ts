import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";
import { IUser } from "./user.interface.js";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "CUSTOMER"],
      default: "CUSTOMER",
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED", "DELETED"],
      default: "ACTIVE",
      index: true,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    orderStats: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      deliveredOrders: {
        type: Number,
        default: 0,
      },
      returnedOrders: {
        type: Number,
        default: 0,
      },
      cancelledOrders: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 100,
      },
    },

    codAllowed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
