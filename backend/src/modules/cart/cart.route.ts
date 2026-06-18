import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  addToCartValidation,
  removeCartItemValidation,
  updateCartItemValidation,
} from "./cart.validation.js";
import { CartController } from "./cart.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/", authGuard("CUSTOMER"), CartController.getMyCart);

router.post(
  "/items",
  authGuard("CUSTOMER"),
  validateRequest(addToCartValidation),
  CartController.addToCart,
);

router.patch(
  "/items/:itemId",
  authGuard("CUSTOMER"),
  validateRequest(updateCartItemValidation),
  CartController.updateCartItem,
);

router.delete(
  "/items/:itemId",
  authGuard("CUSTOMER"),
  validateRequest(removeCartItemValidation),
  CartController.removeCartItem,
);

router.delete("/clear", authGuard("CUSTOMER"), CartController.clearCart);

export const cartRoutes = router;
