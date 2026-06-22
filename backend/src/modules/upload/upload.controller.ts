import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { httpStatus } from "../../constants/httpStatus.js";

import { UploadService } from "./upload.service.js";
import { TFilePurpose } from "./upload.interface.js";

const uploadGeneralImage = catchAsync(async (req: Request, res: Response) => {
  const result = await UploadService.uploadSingleImage(req.file, {
    purpose: "GENERAL",
    uploadedBy: req.user!.userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Image uploaded successfully",
    data: result,
  });
});

const uploadMultipleGeneralImages = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UploadService.uploadMultipleImages(req.files as any, {
      purpose: "GENERAL",
      uploadedBy: req.user!.userId,
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Images uploaded successfully",
      data: result,
    });
  },
);

const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
  const result = await UploadService.uploadAvatar(req.user!.userId, req.file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Avatar uploaded successfully",
    data: result,
  });
});

const uploadProductImages = catchAsync(async (req: Request, res: Response) => {
  const result = await UploadService.uploadProductImages(
    req.user!.userId,
    req.params.productId,
    req.files as Express.Multer.File[],
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product images uploaded successfully",
    data: result,
  });
});

const uploadReviewImages = catchAsync(async (req: Request, res: Response) => {
  const result = await UploadService.uploadReviewImages(
    req.user!.userId,
    req.files as Express.Multer.File[],
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review images uploaded successfully",
    data: result,
  });
});

const getMyUploadedFiles = catchAsync(async (req: Request, res: Response) => {
  const result = await UploadService.getMyUploadedFiles(req.user!.userId, {
    purpose: req.query.purpose as TFilePurpose,
    page: req.query.page as string,
    limit: req.query.limit as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My uploaded files retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllUploadedFilesForAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UploadService.getAllUploadedFilesForAdmin({
      purpose: req.query.purpose as TFilePurpose,
      provider: req.query.provider as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Uploaded files retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const softDeleteFileAsset = catchAsync(async (req: Request, res: Response) => {
  const result = await UploadService.softDeleteFileAsset(req.params.fileId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File deleted successfully",
    data: result,
  });
});

export const UploadController = {
  uploadGeneralImage,
  uploadMultipleGeneralImages,
  uploadAvatar,
  uploadProductImages,
  uploadReviewImages,
  getMyUploadedFiles,
  getAllUploadedFilesForAdmin,
  softDeleteFileAsset,
};
