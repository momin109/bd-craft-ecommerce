import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { TUserRole } from "../user/user.interface.js";

export const normalizeBangladeshiMobile = (mobile: string): string => {
  const cleanMobile = mobile.replace(/\s+/g, "");

  if (cleanMobile.startsWith("+8801")) {
    return cleanMobile;
  }

  if (cleanMobile.startsWith("8801")) {
    return `+${cleanMobile}`;
  }

  if (cleanMobile.startsWith("01")) {
    return `+88${cleanMobile}`;
  }

  return cleanMobile;
};

type TJwtPayload = {
  userId: string;
  role: TUserRole;
  mobile: string;
};

export const createAccessToken = (payload: TJwtPayload): string => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: "15m",
  });
};

export const createRefreshToken = (payload: TJwtPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: "30d",
  });
};
