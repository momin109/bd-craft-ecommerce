import { Router } from "express";

// import { authGuard } from "../../middlewares/authGuard.js";
import { uploadImageMiddleware } from "./upload.middleware.js";
import { UploadController } from "./upload.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

router.post(
  "/single",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  uploadImageMiddleware.single("image"),
  UploadController.uploadGeneralImage,
);

router.post(
  "/multiple",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  uploadImageMiddleware.array("images", 10),
  UploadController.uploadMultipleGeneralImages,
);

router.post(
  "/avatar",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  uploadImageMiddleware.single("avatar"),
  UploadController.uploadAvatar,
);

router.post(
  "/products/:productId/images",
  authGuard("SUPER_ADMIN", "ADMIN"),
  uploadImageMiddleware.array("images", 10),
  UploadController.uploadProductImages,
);

router.post(
  "/review-images",
  authGuard("CUSTOMER"),
  uploadImageMiddleware.array("images", 5),
  UploadController.uploadReviewImages,
);

router.get(
  "/my-files",
  authGuard("CUSTOMER", "ADMIN", "SUPER_ADMIN"),
  UploadController.getMyUploadedFiles,
);

router.get(
  "/admin/files",
  authGuard("SUPER_ADMIN", "ADMIN"),
  UploadController.getAllUploadedFilesForAdmin,
);

router.delete(
  "/admin/files/:fileId",
  authGuard("SUPER_ADMIN", "ADMIN"),
  UploadController.softDeleteFileAsset,
);

export const uploadRoutes = router;
