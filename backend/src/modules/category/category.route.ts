import { Router } from "express";
// import { authGuard } from "../../middlewares/authGuard.js";
// import { validateRequest } from "../../middlewares/validateRequest.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "./category.validation.js";
import { CategoryController } from "./category.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { validateRequest } from "../../middleware/validateRequest.js";

const router = Router();

router.get("/", CategoryController.getAllCategories);
router.get("/:slug", CategoryController.getSingleCategory);

router.post(
  "/",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(createCategoryValidation),
  CategoryController.createCategory,
);

router.patch(
  "/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  validateRequest(updateCategoryValidation),
  CategoryController.updateCategory,
);

router.delete(
  "/:id",
  authGuard("SUPER_ADMIN", "ADMIN"),
  CategoryController.deleteCategory,
);

export const categoryRoutes = router;
