import { z } from "zod";

export const createReviewValidation = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    productId: z.string().min(1, "Product ID is required"),
    variantId: z.string().optional(),

    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const updateReviewStatusValidation = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "HIDDEN"]),
    adminNote: z.string().optional(),
  }),
});

export const reviewQueryValidation = z.object({
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "HIDDEN"]).optional(),
    productId: z.string().optional(),
    customerId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
