import { Types } from "mongoose";

import { env } from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { Product } from "../product/product.model.js";
import { User } from "../user/user.model.js";

import { FileAsset } from "./upload.model.js";
import { TFilePurpose } from "./upload.interface.js";

import { localUploadProvider } from "./providers/localUpload.provider.js";
import { cloudinaryUploadProvider } from "./providers/cloudinaryUpload.provider.js";
import { s3UploadProvider } from "./providers/s3Upload.provider.js";

const getUploadProvider = () => {
  if (env.upload.provider === "LOCAL") {
    return localUploadProvider;
  }

  if (env.upload.provider === "CLOUDINARY") {
    return cloudinaryUploadProvider;
  }

  if (env.upload.provider === "S3") {
    return s3UploadProvider;
  }

  throw new AppError(httpStatus.BAD_REQUEST, "Invalid upload provider");
};

const uploadSingleImage = async (
  file: Express.Multer.File | undefined,
  payload: {
    purpose: TFilePurpose;
    uploadedBy?: string;
    relatedProduct?: string;
    relatedReview?: string;
  },
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image file is required");
  }

  const provider = getUploadProvider();

  const uploaded = await provider.upload({
    file,
    purpose: payload.purpose,
  });

  const fileAsset = await FileAsset.create({
    originalName: file.originalname,
    fileName: uploaded.fileName,
    mimeType: file.mimetype,
    size: file.size,

    url: uploaded.url,
    key: uploaded.key,

    provider: env.upload.provider,
    purpose: payload.purpose,

    uploadedBy: payload.uploadedBy
      ? new Types.ObjectId(payload.uploadedBy)
      : undefined,

    relatedProduct: payload.relatedProduct
      ? new Types.ObjectId(payload.relatedProduct)
      : undefined,

    relatedReview: payload.relatedReview
      ? new Types.ObjectId(payload.relatedReview)
      : undefined,

    isDeleted: false,
  });

  return fileAsset;
};

const uploadMultipleImages = async (
  files: Express.Multer.File[] | undefined,
  payload: {
    purpose: TFilePurpose;
    uploadedBy?: string;
    relatedProduct?: string;
    relatedReview?: string;
  },
) => {
  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image files are required");
  }

  const uploadedFiles = [];

  for (const file of files) {
    const uploaded = await uploadSingleImage(file, payload);
    uploadedFiles.push(uploaded);
  }

  return uploadedFiles;
};

const uploadAvatar = async (
  userId: string,
  file: Express.Multer.File | undefined,
) => {
  const uploaded = await uploadSingleImage(file, {
    purpose: "AVATAR",
    uploadedBy: userId,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    {
      avatar: uploaded.url,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    avatar: uploaded,
    user,
  };
};

const uploadProductImages = async (
  adminId: string,
  productId: string,
  files: Express.Multer.File[] | undefined,
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const uploadedFiles = await uploadMultipleImages(files, {
    purpose: "PRODUCT_IMAGE",
    uploadedBy: adminId,
    relatedProduct: productId,
  });

  const imageUrls = uploadedFiles.map((file) => file.url);

  product.images = [...product.images, ...imageUrls];
  await product.save();

  return {
    uploadedFiles,
    product,
  };
};

const uploadReviewImages = async (
  userId: string,
  files: Express.Multer.File[] | undefined,
) => {
  const uploadedFiles = await uploadMultipleImages(files, {
    purpose: "REVIEW_IMAGE",
    uploadedBy: userId,
  });

  return uploadedFiles;
};

const getMyUploadedFiles = async (
  userId: string,
  query: {
    purpose?: TFilePurpose;
    page?: string;
    limit?: string;
  },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    uploadedBy: userId,
    isDeleted: false,
  };

  if (query.purpose) {
    filter.purpose = query.purpose;
  }

  const [files, total] = await Promise.all([
    FileAsset.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    FileAsset.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: files,
  };
};

const getAllUploadedFilesForAdmin = async (query: {
  purpose?: TFilePurpose;
  provider?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (query.purpose) {
    filter.purpose = query.purpose;
  }

  if (query.provider) {
    filter.provider = query.provider;
  }

  const [files, total] = await Promise.all([
    FileAsset.find(filter)
      .populate("uploadedBy", "name mobile email")
      .populate("relatedProduct", "name slug")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    FileAsset.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: files,
  };
};

const softDeleteFileAsset = async (fileId: string) => {
  const file = await FileAsset.findByIdAndUpdate(
    fileId,
    {
      isDeleted: true,
    },
    {
      new: true,
    },
  );

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "File not found");
  }

  return file;
};

export const UploadService = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadAvatar,
  uploadProductImages,
  uploadReviewImages,
  getMyUploadedFiles,
  getAllUploadedFilesForAdmin,
  softDeleteFileAsset,
};
