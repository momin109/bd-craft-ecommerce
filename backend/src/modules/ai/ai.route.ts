import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  applyAiCopyValidation,
  generateFromProductValidation,
  generateProductCopyValidation,
} from "./ai.validation.js";

import { AiController } from "./ai.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.use(authGuard("SUPER_ADMIN", "ADMIN"));

router.post(
  "/product-copy/generate",
  validateRequest(generateProductCopyValidation),
  AiController.generateProductCopy,
);

router.post(
  "/products/:productId/generate-copy",
  validateRequest(generateFromProductValidation),
  AiController.generateProductCopyFromProduct,
);

router.patch(
  "/products/:productId/apply-copy",
  validateRequest(applyAiCopyValidation),
  AiController.applyAiCopyToProduct,
);

router.get("/generations", AiController.getAiGenerationLogs);

export const aiRoutes = router;
