import { Types } from "mongoose";

export type TAiGenerationType = "PRODUCT_COPY";
export type TAiGenerationStatus = "GENERATED" | "APPLIED" | "FAILED";
export type TAiLanguage = "bn" | "en";

export interface IAiProductCopy {
  productName: string;
  shortDescription: string;
  description: string;

  metaTitle: string;
  metaDescription: string;

  tags: string[];

  facebookAdPrimaryText: string;
  facebookAdHeadline: string;

  searchKeywords: string[];
}

export interface IAiGenerationLog {
  type: TAiGenerationType;
  status: TAiGenerationStatus;

  product?: Types.ObjectId;

  language: TAiLanguage;

  inputPayload: unknown;
  outputPayload?: IAiProductCopy;

  provider: "OPENAI" | "MOCK";
  model?: string;

  appliedBy?: Types.ObjectId;
  appliedAt?: Date;

  errorMessage?: string;
}
