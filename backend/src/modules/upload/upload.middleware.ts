import { env } from "../../config/env.js";

import multer from "multer";
import { Request } from "express";

// import { env } from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { allowedImageMimeTypes } from "./upload.utils.js";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  if (!allowedImageMimeTypes.includes(file.mimetype)) {
    callback(
      new AppError(
        httpStatus.BAD_REQUEST,
        "Only JPG, PNG, WEBP and GIF images are allowed",
      ),
    );
    return;
  }

  callback(null, true);
};

export const uploadImageMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeMb * 1024 * 1024,
  },
});
