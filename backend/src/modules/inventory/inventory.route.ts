import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  inventoryLogQueryValidation,
  manualStockAdjustmentValidation,
} from "./inventory.validation.js";

import { InventoryController } from "./inventory.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/adjust",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(manualStockAdjustmentValidation),
  InventoryController.manualStockAdjustment,
);

router.get(
  "/logs",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(inventoryLogQueryValidation),
  InventoryController.getStockAdjustmentLogs,
);

export const inventoryRoutes = router;
