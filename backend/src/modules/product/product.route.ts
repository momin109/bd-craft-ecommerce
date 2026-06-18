import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  adjustStockValidation,
  createProductValidation,
  updateProductValidation,
} from "./product.validation.js";
import { ProductController } from "./product.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/", ProductController.getAllProducts);
router.get(
  "/low-stock",
  authGuard("SUPER_ADMIN", "ADMIN"),
  ProductController.getLowStockProducts,
);
router.get("/:slug", ProductController.getSingleProduct);

router.post(
  "/",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(createProductValidation),
  ProductController.createProduct,
);

router.patch(
  "/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateProductValidation),
  ProductController.updateProduct,
);

router.patch(
  "/:productId/variants/:variantId/stock",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(adjustStockValidation),
  ProductController.adjustVariantStock,
);

router.delete(
  "/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  ProductController.deleteProduct,
);

export const productRoutes = router;
