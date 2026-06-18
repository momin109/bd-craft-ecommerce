import { Router } from "express";
import { httpStatus } from "../constants/httpStatus.js";
import { sendResponse } from "../utils/sendResponse.js";

const router = Router();

router.get("/", (_req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "E-commerce backend is running",
    data: {
      service: "ecommerce-backend",
      status: "healthy",
    },
  });
});

export const healthRoutes = router;
