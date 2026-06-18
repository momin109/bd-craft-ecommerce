import { z } from "zod";

export const addToCartValidation = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    variantId: z.string().min(1, "Variant ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1").default(1),
  }),
});

export const updateCartItemValidation = z.object({
  params: z.object({
    itemId: z.string().min(1, "Cart item ID is required"),
  }),

  body: z.object({
    quantity: z.number().min(1, "Quantity must be at least 1"),
  }),
});

export const removeCartItemValidation = z.object({
  params: z.object({
    itemId: z.string().min(1, "Cart item ID is required"),
  }),
});
