import { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    error:
      env.nodeEnv === "development"
        ? {
            name: err.name,
            stack: err.stack,
          }
        : undefined,
  });
};
