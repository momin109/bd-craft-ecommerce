import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  applyCouponValidation,
  createCouponValidation,
  updateCouponValidation,
} from "./coupon.validation.js";

import { CouponController } from "./coupon.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/apply",
  authGuard("CUSTOMER"),
  validateRequest(applyCouponValidation),
  CouponController.applyCouponToCart,
);

router.get(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  CouponController.getAllCoupons,
);

router.post(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(createCouponValidation),
  CouponController.createCoupon,
);

router.patch(
  "/admin/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateCouponValidation),
  CouponController.updateCoupon,
);

router.delete(
  "/admin/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  CouponController.deleteCoupon,
);

export const couponRoutes = router;
