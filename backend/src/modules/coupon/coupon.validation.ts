import { z } from "zod";

export const createCouponValidation = z.object({
  body: z.object({
    code: z.string().min(2, "Coupon code is required"),
    title: z.string().min(2, "Coupon title is required"),
    description: z.string().optional(),

    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().min(0),
    maxDiscount: z.number().min(0).optional(),

    minOrderAmount: z.number().min(0).default(0),

    startDate: z.string().datetime(),
    endDate: z.string().datetime(),

    usageLimit: z.number().min(1).optional(),
    perCustomerLimit: z.number().min(1).default(1),

    scope: z
      .enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES"])
      .default("ALL_PRODUCTS"),

    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    excludedProducts: z.array(z.string()).optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const updateCouponValidation = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),

    discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
    discountValue: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),

    minOrderAmount: z.number().min(0).optional(),

    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),

    usageLimit: z.number().min(1).optional(),
    perCustomerLimit: z.number().min(1).optional(),

    scope: z
      .enum(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS", "SPECIFIC_CATEGORIES"])
      .optional(),

    applicableProducts: z.array(z.string()).optional(),
    applicableCategories: z.array(z.string()).optional(),
    excludedProducts: z.array(z.string()).optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const applyCouponValidation = z.object({
  body: z.object({
    code: z.string().min(2, "Coupon code is required"),
  }),
});
