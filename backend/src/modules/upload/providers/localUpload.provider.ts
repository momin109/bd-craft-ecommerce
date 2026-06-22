import fs from "fs";
import path from "path";

import { env } from "../../../config/env.js";
import { generateSafeFileName, getFolderByPurpose } from "../upload.utils.js";
import { TFilePurpose } from "../upload.interface.js";

type TUploadProviderPayload = {
  file: Express.Multer.File;
  purpose: TFilePurpose;
};

const upload = async (payload: TUploadProviderPayload) => {
  const folder = getFolderByPurpose(payload.purpose);
  const fileName = generateSafeFileName(payload.file.originalname);

  const relativePath = path.join(folder, fileName);
  const uploadPath = path.join(
    process.cwd(),
    "storage",
    "uploads",
    relativePath,
  );

  const uploadDir = path.dirname(uploadPath);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
      recursive: true,
    });
  }

  await fs.promises.writeFile(uploadPath, payload.file.buffer);

  const normalizedKey = relativePath.replace(/\\/g, "/");

  return {
    fileName,
    key: normalizedKey,
    url: `${env.upload.local.publicUrl}/${normalizedKey}`,
  };
};

export const localUploadProvider = {
  upload,
};
