import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  createReviewValidation,
  reviewQueryValidation,
  updateReviewStatusValidation,
} from "./review.validation.js";

import { ReviewController } from "./review.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/products/:productId", ReviewController.getProductReviews);

router.get("/my-reviews", authGuard("CUSTOMER"), ReviewController.getMyReviews);

router.post(
  "/",
  authGuard("CUSTOMER"),
  validateRequest(createReviewValidation),
  ReviewController.createReview,
);

router.get(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(reviewQueryValidation),
  ReviewController.getAllReviewsForAdmin,
);

router.patch(
  "/admin/:reviewId/status",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateReviewStatusValidation),
  ReviewController.updateReviewStatus,
);

router.patch(
  "/admin/:reviewId/hide",
  authGuard("SUPER_ADMIN", "ADMIN"),
  ReviewController.hideReview,
);

export const reviewRoutes = router;
