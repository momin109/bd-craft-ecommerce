import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  createReturnRequestValidation,
  refundReturnValidation,
  restockReturnValidation,
  returnQueryValidation,
  updateReturnStatusValidation,
} from "./return.validation.js";

import { ReturnController } from "./return.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.post(
  "/",
  authGuard("CUSTOMER"),
  validateRequest(createReturnRequestValidation),
  ReturnController.createReturnRequest,
);

router.get("/my-returns", authGuard("CUSTOMER"), ReturnController.getMyReturns);

router.get(
  "/my-returns/:returnId",
  authGuard("CUSTOMER"),
  ReturnController.getMyReturnDetails,
);

router.get(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(returnQueryValidation),
  ReturnController.getAllReturnsForAdmin,
);

router.get(
  "/admin/:returnId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  ReturnController.getSingleReturnForAdmin,
);

router.patch(
  "/admin/:returnId/status",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateReturnStatusValidation),
  ReturnController.updateReturnStatus,
);

router.patch(
  "/admin/:returnId/restock",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(restockReturnValidation),
  ReturnController.restockReturnItems,
);

router.patch(
  "/admin/:returnId/refund",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(refundReturnValidation),
  ReturnController.markReturnRefunded,
);

export const returnRoutes = router;
