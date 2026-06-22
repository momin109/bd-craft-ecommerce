import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

import { env } from "../../../config/env.js";
import { AppError } from "../../../errors/AppError.js";
import { httpStatus } from "../../../constants/httpStatus.js";
import { generateSafeFileName, getFolderByPurpose } from "../upload.utils.js";
import { TFilePurpose } from "../upload.interface.js";

type TUploadProviderPayload = {
  file: Express.Multer.File;
  purpose: TFilePurpose;
};

const ensureConfig = () => {
  if (
    !env.upload.cloudinary.cloudName ||
    !env.upload.cloudinary.apiKey ||
    !env.upload.cloudinary.apiSecret
  ) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cloudinary configuration is missing",
    );
  }

  cloudinary.config({
    cloud_name: env.upload.cloudinary.cloudName,
    api_key: env.upload.cloudinary.apiKey,
    api_secret: env.upload.cloudinary.apiSecret,
  });
};

const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: {
    folder: string;
    publicId: string;
  },
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
};

const upload = async (payload: TUploadProviderPayload) => {
  ensureConfig();

  const folder = `ecommerce/${getFolderByPurpose(payload.purpose)}`;
  const safeFileName = generateSafeFileName(payload.file.originalname);
  const publicId = safeFileName.replace(/\.[^/.]+$/, "");

  const result = await uploadBufferToCloudinary(payload.file.buffer, {
    folder,
    publicId,
  });

  return {
    fileName: safeFileName,
    key: result.public_id,
    url: result.secure_url,
  };
};

export const cloudinaryUploadProvider = {
  upload,
};
