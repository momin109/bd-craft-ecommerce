import { z } from "zod";

export const generateProductCopyValidation = z.object({
  body: z.object({
    language: z.enum(["bn", "en"]).optional(),

    productName: z.string().min(2, "Product name is required"),
    categoryName: z.string().optional(),
    brand: z.string().optional(),

    sellingPrice: z.number().min(0).optional(),

    targetAudience: z.string().optional(),
    keyFeatures: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),

    tone: z
      .enum(["premium", "friendly", "luxury", "simple", "youthful"])
      .optional(),

    extraInstructions: z.string().optional(),
  }),
});

export const generateFromProductValidation = z.object({
  body: z.object({
    language: z.enum(["bn", "en"]).optional(),
    tone: z
      .enum(["premium", "friendly", "luxury", "simple", "youthful"])
      .optional(),
    targetAudience: z.string().optional(),
    extraInstructions: z.string().optional(),
  }),
});

export const applyAiCopyValidation = z.object({
  body: z.object({
    generationId: z.string().min(1, "Generation ID is required"),

    applyFields: z
      .array(
        z.enum([
          "name",
          "shortDescription",
          "description",
          "metaTitle",
          "metaDescription",
          "tags",
        ]),
      )
      .default([
        "shortDescription",
        "description",
        "metaTitle",
        "metaDescription",
        "tags",
      ]),
  }),
});
