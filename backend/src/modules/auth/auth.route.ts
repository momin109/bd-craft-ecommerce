import { Router } from "express";
// import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  loginValidation,
  registerUserValidation,
  verifyOtpValidation,
} from "./auth.validation.js";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserValidation),
  AuthController.registerUser,
);

router.post(
  "/verify-otp",
  validateRequest(verifyOtpValidation),
  AuthController.verifyMobileOtp,
);

router.post(
  "/login",
  validateRequest(loginValidation),
  AuthController.loginUser,
);

export const authRoutes = router;
