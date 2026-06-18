import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
import { PaymentController } from "./payment.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

router.post(
  "/:orderId/initiate",
  authGuard("CUSTOMER"),
  PaymentController.initiatePayment,
);

router.all(
  "/callback/:gateway/:callbackType",
  PaymentController.handleCallback,
);

export const paymentRoutes = router;
