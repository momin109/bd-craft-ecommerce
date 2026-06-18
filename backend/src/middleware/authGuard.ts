import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { TUserRole } from "../modules/user/user.interface.js";
import { User } from "../modules/user/user.model.js";

type TDecodedUser = {
  userId: string;
  role: TUserRole;
  mobile: string;
};

export const authGuard =
  (...allowedRoles: TUserRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Access token is required");
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, env.jwtAccessSecret) as TDecodedUser;

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
      }

      if (user.status !== "ACTIVE") {
        throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not allowed to access this resource",
        );
      }

      req.user = {
        userId: user._id.toString(),
        role: user.role,
        mobile: user.mobile,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
