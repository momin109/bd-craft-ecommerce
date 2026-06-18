import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";
import { wishlistProductValidation } from "./wishlist.validation.js";
import { WishlistController } from "./wishlist.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/", authGuard("CUSTOMER"), WishlistController.getMyWishlist);

router.get(
  "/:productId/check",
  authGuard("CUSTOMER"),
  validateRequest(wishlistProductValidation),
  WishlistController.checkWishlistProduct,
);

router.post(
  "/:productId",
  authGuard("CUSTOMER"),
  validateRequest(wishlistProductValidation),
  WishlistController.addToWishlist,
);

router.delete(
  "/:productId",
  authGuard("CUSTOMER"),
  validateRequest(wishlistProductValidation),
  WishlistController.removeFromWishlist,
);

export const wishlistRoutes = router;
