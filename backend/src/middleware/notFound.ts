import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { httpStatus } from "../constants/httpStatus.js";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(httpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`),
  );
};
