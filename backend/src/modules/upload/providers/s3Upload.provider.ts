import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
    !env.upload.s3.region ||
    !env.upload.s3.bucket ||
    !env.upload.s3.accessKeyId ||
    !env.upload.s3.secretAccessKey ||
    !env.upload.s3.publicUrl
  ) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "AWS S3 configuration is missing",
    );
  }
};

const getS3Client = () => {
  ensureConfig();

  return new S3Client({
    region: env.upload.s3.region,
    credentials: {
      accessKeyId: env.upload.s3.accessKeyId,
      secretAccessKey: env.upload.s3.secretAccessKey,
    },
  });
};

const upload = async (payload: TUploadProviderPayload) => {
  const client = getS3Client();

  const folder = getFolderByPurpose(payload.purpose);
  const fileName = generateSafeFileName(payload.file.originalname);
  const key = `ecommerce/${folder}/${fileName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: env.upload.s3.bucket,
      Key: key,
      Body: payload.file.buffer,
      ContentType: payload.file.mimetype,
    }),
  );

  return {
    fileName,
    key,
    url: `${env.upload.s3.publicUrl}/${key}`,
  };
};

export const s3UploadProvider = {
  upload,
};
