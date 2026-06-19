import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  adminCustomerQueryValidation,
  changePasswordValidation,
  updateCustomerByAdminValidation,
  updateCustomerCodValidation,
  updateCustomerNoteValidation,
  updateCustomerStatusValidation,
  updateMyProfileValidation,
} from "./user.validation.js";

import { UserController } from "./user.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get(
  "/me",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  UserController.getMyProfile,
);

router.patch(
  "/me",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  validateRequest(updateMyProfileValidation),
  UserController.updateMyProfile,
);

router.patch(
  "/me/change-password",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  validateRequest(changePasswordValidation),
  UserController.changePassword,
);

router.get(
  "/admin/customers",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(adminCustomerQueryValidation),
  UserController.getAllCustomersForAdmin,
);

router.get(
  "/admin/customers/:customerId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  UserController.getCustomerDetailsForAdmin,
);

router.get(
  "/admin/customers/:customerId/orders",
  authGuard("SUPER_ADMIN", "ADMIN"),
  UserController.getCustomerOrdersForAdmin,
);

router.patch(
  "/admin/customers/:customerId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateCustomerByAdminValidation),
  UserController.updateCustomerByAdmin,
);

router.patch(
  "/admin/customers/:customerId/cod",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateCustomerCodValidation),
  UserController.updateCustomerCodAccess,
);

router.patch(
  "/admin/customers/:customerId/status",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateCustomerStatusValidation),
  UserController.updateCustomerStatus,
);

router.patch(
  "/admin/customers/:customerId/note",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateCustomerNoteValidation),
  UserController.updateCustomerNote,
);

router.delete(
  "/admin/customers/:customerId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  UserController.softDeleteCustomer,
);

export const userRoutes = router;
