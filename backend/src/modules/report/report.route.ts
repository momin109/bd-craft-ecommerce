import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import { reportQueryValidation } from "./report.validation.js";
import { ReportController } from "./report.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.use(authGuard("SUPER_ADMIN", "ADMIN"));

router.get("/dashboard", ReportController.getDashboardSummary);

router.get(
  "/sales",
  validateRequest(reportQueryValidation),
  ReportController.getSalesReport,
);

router.get(
  "/products",
  validateRequest(reportQueryValidation),
  ReportController.getProductWiseSalesReport,
);

router.get(
  "/customers",
  validateRequest(reportQueryValidation),
  ReportController.getCustomerWiseSalesReport,
);

router.get(
  "/couriers",
  validateRequest(reportQueryValidation),
  ReportController.getCourierWiseReport,
);

router.get(
  "/returns",
  validateRequest(reportQueryValidation),
  ReportController.getReturnReport,
);

router.get(
  "/profit",
  validateRequest(reportQueryValidation),
  ReportController.getProfitReport,
);

router.get(
  "/export/:type",
  validateRequest(reportQueryValidation),
  ReportController.exportReportToCsv,
);

export const reportRoutes = router;
