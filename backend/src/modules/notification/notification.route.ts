import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import { NotificationController } from "./notification.controller.js";
import { customNotificationValidation } from "./notification.validation.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get(
  "/logs",
  authGuard("SUPER_ADMIN", "ADMIN"),
  NotificationController.getNotificationLogs,
);

router.post(
  "/send",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(customNotificationValidation),
  NotificationController.sendCustomNotification,
);

export const notificationRoutes = router;
