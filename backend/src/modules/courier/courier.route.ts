import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  bookCourierValidation,
  syncCourierValidation,
} from "./courier.validation.js";

import { CourierController } from "./courier.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get(
  "/shipments",
  authGuard("SUPER_ADMIN", "ADMIN"),
  CourierController.getAllShipments,
);

router.get(
  "/orders/:orderId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  CourierController.getShipmentByOrder,
);

router.post(
  "/orders/:orderId/book",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(bookCourierValidation),
  CourierController.bookCourierForOrder,
);

router.post(
  "/shipments/:shipmentId/sync",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(syncCourierValidation),
  CourierController.syncShipmentStatus,
);

export const courierRoutes = router;
