import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { env } from "../config/env.js";
import { TUserRole } from "../modules/user/user.interface.js";

type TDecodedUser = {
  userId: string;
  role: TUserRole;
  mobile: string;
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwtAccessSecret) as TDecodedUser;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      mobile: decoded.mobile,
    };

    next();
  } catch {
    next();
  }
};
