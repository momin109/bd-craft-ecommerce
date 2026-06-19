import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
import { ReferralController } from "./referral.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

router.get(
  "/my-dashboard",
  authGuard("CUSTOMER"),
  ReferralController.getMyReferralDashboard,
);

router.get(
  "/admin/report",
  authGuard("SUPER_ADMIN", "ADMIN"),
  ReferralController.getReferralReportForAdmin,
);

export const referralRoutes = router;
