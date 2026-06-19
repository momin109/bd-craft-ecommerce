import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { optionalAuth } from "../../middlewares/optionalAuth.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import { trackMetaEventValidation } from "./facebookCapi.validation.js";
import { FacebookCapiController } from "./facebookCapi.controller.js";
import { optionalAuth } from "../../middleware/optionalAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

router.post(
  "/track",
  optionalAuth,
  validateRequest(trackMetaEventValidation),
  FacebookCapiController.trackEvent,
);

router.get(
  "/logs",
  authGuard("SUPER_ADMIN", "ADMIN"),
  FacebookCapiController.getEventLogs,
);

export const facebookCapiRoutes = router;
