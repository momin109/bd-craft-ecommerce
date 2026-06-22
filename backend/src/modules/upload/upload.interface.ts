import { Types } from "mongoose";

export type TUploadProvider = "LOCAL" | "CLOUDINARY" | "S3";

export type TFilePurpose =
  | "PRODUCT_IMAGE"
  | "REVIEW_IMAGE"
  | "AVATAR"
  | "GENERAL";

export interface IFileAsset {
  originalName: string;
  fileName: string;

  mimeType: string;
  size: number;

  url: string;
  key: string;

  provider: TUploadProvider;
  purpose: TFilePurpose;

  uploadedBy?: Types.ObjectId;

  relatedProduct?: Types.ObjectId;
  relatedReview?: Types.ObjectId;

  isDeleted: boolean;
}
