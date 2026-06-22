import path from "path";
import crypto from "crypto";

export const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const generateSafeFileName = (originalName: string) => {
  const extension = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(12).toString("hex");

  return `${Date.now()}-${random}${extension}`;
};

export const getFolderByPurpose = (purpose: string) => {
  if (purpose === "PRODUCT_IMAGE") {
    return "products";
  }

  if (purpose === "REVIEW_IMAGE") {
    return "reviews";
  }

  if (purpose === "AVATAR") {
    return "avatars";
  }

  return "general";
};
