import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
import { AbandonedCartController } from "./abandonedCart.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

router.post(
  "/run",
  authGuard("SUPER_ADMIN", "ADMIN"),
  AbandonedCartController.runAbandonedCartRecovery,
);

router.get(
  "/logs",
  authGuard("SUPER_ADMIN", "ADMIN"),
  AbandonedCartController.getAbandonedCartLogs,
);

export const abandonedCartRoutes = router;
