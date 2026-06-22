import multer from "multer";
import { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size is too large";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded";
    } else {
      message = err.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      env.nodeEnv === "development"
        ? {
            name: err.name,
            stack: err.stack,
          }
        : undefined,
  });
};
