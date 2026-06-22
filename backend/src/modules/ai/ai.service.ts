import { Types } from "mongoose";

import { AppError } from "../../errors/AppError.js";
import { httpStatus } from "../../constants/httpStatus.js";
import { env } from "../../config/env.js";

import { Product } from "../product/product.model.js";
import { Category } from "../category/category.model.js";
import { createSlug } from "../../utils/createSlug.js";

import { AiGenerationLog } from "./ai.model.js";
import { IAiProductCopy, TAiLanguage } from "./ai.interface.js";
import { openAiProvider } from "./providers/openai.provider.js";

type TGenerateProductCopyPayload = {
  language?: TAiLanguage;

  productName: string;
  categoryName?: string;
  brand?: string;
  sellingPrice?: number;

  targetAudience?: string;
  keyFeatures?: string[];
  materials?: string[];
  sizes?: string[];
  colors?: string[];

  tone?: "premium" | "friendly" | "luxury" | "simple" | "youthful";

  extraInstructions?: string;
};

const generateProductCopy = async (
  payload: TGenerateProductCopyPayload,
  productId?: string,
) => {
  try {
    const normalizedPayload = {
      ...payload,
      language: payload.language || env.ai.defaultLanguage,
    } as TGenerateProductCopyPayload & {
      language: TAiLanguage;
    };

    const result = await openAiProvider.generateProductCopy(normalizedPayload);

    const log = await AiGenerationLog.create({
      type: "PRODUCT_COPY",
      status: "GENERATED",
      product: productId ? new Types.ObjectId(productId) : undefined,
      language: normalizedPayload.language,
      inputPayload: normalizedPayload,
      outputPayload: result.output,
      provider: result.provider,
      model: result.model,
    });

    return log;
  } catch (error: any) {
    const log = await AiGenerationLog.create({
      type: "PRODUCT_COPY",
      status: "FAILED",
      product: productId ? new Types.ObjectId(productId) : undefined,
      language: payload.language || env.ai.defaultLanguage,
      inputPayload: payload,
      provider: env.ai.enabled ? "OPENAI" : "MOCK",
      model: env.ai.openaiModel,
      errorMessage: error.message || "AI generation failed",
    });

    return log;
  }
};

const generateProductCopyFromProduct = async (
  productId: string,
  payload: {
    language?: TAiLanguage;
    tone?: string;
    targetAudience?: string;
    extraInstructions?: string;
  },
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const category = await Category.findById(product.category);

  const sizes = Array.from(
    new Set(product.variants.map((variant) => variant.size).filter(Boolean)),
  ) as string[];

  const colors = Array.from(
    new Set(product.variants.map((variant) => variant.color).filter(Boolean)),
  ) as string[];

  const keyFeatures = [
    product.shortDescription,
    product.description,
    ...product.tags,
  ].filter(Boolean) as string[];

  return generateProductCopy(
    {
      language: payload.language,
      productName: product.name,
      categoryName: category?.name,
      brand: product.brand,
      sellingPrice: product.baseSellingPrice,
      targetAudience: payload.targetAudience,
      keyFeatures,
      sizes,
      colors,
      tone: payload.tone as any,
      extraInstructions: payload.extraInstructions,
    },
    productId,
  );
};

const applyAiCopyToProduct = async (
  adminId: string,
  productId: string,
  payload: {
    generationId: string;
    applyFields: string[];
  },
) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const generation = await AiGenerationLog.findOne({
    _id: payload.generationId,
    product: productId,
    status: "GENERATED",
  });

  if (!generation || !generation.outputPayload) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "AI generation not found or already applied",
    );
  }

  const output = generation.outputPayload as IAiProductCopy;
  const updateData: Record<string, unknown> = {};

  if (payload.applyFields.includes("name")) {
    updateData.name = output.productName;
    updateData.slug = createSlug(output.productName);
  }

  if (payload.applyFields.includes("shortDescription")) {
    updateData.shortDescription = output.shortDescription;
  }

  if (payload.applyFields.includes("description")) {
    updateData.description = output.description;
  }

  if (payload.applyFields.includes("metaTitle")) {
    updateData.metaTitle = output.metaTitle;
  }

  if (payload.applyFields.includes("metaDescription")) {
    updateData.metaDescription = output.metaDescription;
  }

  if (payload.applyFields.includes("tags")) {
    updateData.tags = output.tags;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  generation.status = "APPLIED";
  generation.appliedBy = new Types.ObjectId(adminId);
  generation.appliedAt = new Date();
  await generation.save();

  return {
    product: updatedProduct,
    generation,
  };
};

const getAiGenerationLogs = async (query: {
  status?: string;
  productId?: string;
  language?: TAiLanguage;
  page?: string;
  limit?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.productId) {
    filter.product = query.productId;
  }

  if (query.language) {
    filter.language = query.language;
  }

  const [logs, total] = await Promise.all([
    AiGenerationLog.find(filter)
      .populate("product", "name slug images")
      .populate("appliedBy", "name mobile")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
    AiGenerationLog.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: logs,
  };
};

export const AiService = {
  generateProductCopy,
  generateProductCopyFromProduct,
  applyAiCopyToProduct,
  getAiGenerationLogs,
};
