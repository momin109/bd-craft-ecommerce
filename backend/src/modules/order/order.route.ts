import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  checkoutValidation,
  orderQueryValidation,
  updateOrderStatusValidation,
} from "./order.validation.js";

import { OrderController } from "./order.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/checkout",
  authGuard("CUSTOMER"),
  validateRequest(checkoutValidation),
  OrderController.checkoutFromCart,
);

router.get("/my-orders", authGuard("CUSTOMER"), OrderController.getMyOrders);

router.get(
  "/my-orders/:orderId",
  authGuard("CUSTOMER"),
  OrderController.getMySingleOrder,
);

router.get("/track/:orderNumber", OrderController.trackOrder);

router.get(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(orderQueryValidation),
  OrderController.getAllOrdersForAdmin,
);

router.get(
  "/admin/:orderId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  OrderController.getSingleOrderForAdmin,
);

router.patch(
  "/admin/:orderId/status",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateOrderStatusValidation),
  OrderController.updateOrderStatus,
);

export const orderRoutes = router;
