import { z } from "zod";

const variantValidation = z.object({
  sku: z.string().min(1, "SKU is required"),
  size: z.string().optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),

  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),

  stock: z.number().min(0).default(0),
  lowStockAlert: z.number().min(0).default(5),

  warehouse: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createProductValidation = z.object({
  body: z.object({
    name: z.string().min(2, "Product name is required"),

    shortDescription: z.string().optional(),
    description: z.string().optional(),

    category: z.string().min(1, "Category is required"),
    brand: z.string().optional(),

    images: z.array(z.string().url()).optional(),

    basePurchasePrice: z.number().min(0),
    baseSellingPrice: z.number().min(0),

    variants: z
      .array(variantValidation)
      .min(1, "At least one variant is required"),

    tags: z.array(z.string()).optional(),

    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),

    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const updateProductValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),

    shortDescription: z.string().optional(),
    description: z.string().optional(),

    category: z.string().optional(),
    brand: z.string().optional(),

    images: z.array(z.string().url()).optional(),

    basePurchasePrice: z.number().min(0).optional(),
    baseSellingPrice: z.number().min(0).optional(),

    variants: z.array(variantValidation).optional(),

    tags: z.array(z.string()).optional(),

    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),

    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const adjustStockValidation = z.object({
  body: z.object({
    type: z.enum(["INCREASE", "DECREASE", "SET"]),
    quantity: z.number().min(0),
    note: z.string().optional(),
  }),
});
