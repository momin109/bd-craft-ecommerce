import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
import { InvoiceController } from "./invoice.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

router.get(
  "/my-orders/:orderId",
  authGuard("CUSTOMER"),
  InvoiceController.getMyOrderInvoice,
);

router.get("/download/:invoiceNumber", InvoiceController.downloadInvoice);

router.get(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  InvoiceController.getAllInvoicesForAdmin,
);

router.post(
  "/admin/orders/:orderId/generate",
  authGuard("SUPER_ADMIN", "ADMIN"),
  InvoiceController.generateInvoiceForOrder,
);

router.post(
  "/admin/orders/:orderId/email",
  authGuard("SUPER_ADMIN", "ADMIN"),
  InvoiceController.emailInvoiceToCustomer,
);

export const invoiceRoutes = router;
