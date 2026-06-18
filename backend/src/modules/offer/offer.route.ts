import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";

import {
  createOfferValidation,
  updateOfferValidation,
} from "./offer.validation.js";

import { OfferController } from "./offer.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/active", OfferController.getActivePublicOffers);

router.get(
  "/cart-preview",
  authGuard("CUSTOMER"),
  OfferController.previewCartOffers,
);

router.get(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  OfferController.getAllOffers,
);

router.post(
  "/admin",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(createOfferValidation),
  OfferController.createOffer,
);

router.patch(
  "/admin/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateOfferValidation),
  OfferController.updateOffer,
);

router.delete(
  "/admin/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  OfferController.deleteOffer,
);

export const offerRoutes = router;
