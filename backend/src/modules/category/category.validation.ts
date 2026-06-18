import { z } from "zod";

export const createCategoryValidation = z.object({
  body: z.object({
    name: z.string().min(2, "Category name is required"),
    description: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
    parentCategory: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortOrder: z.number().optional(),
  }),
});

export const updateCategoryValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
    parentCategory: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    sortOrder: z.number().optional(),
  }),
});
