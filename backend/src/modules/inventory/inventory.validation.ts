import { z } from "zod";

export const manualStockAdjustmentValidation = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    variantId: z.string().min(1, "Variant ID is required"),

    type: z.enum(["MANUAL_IN", "MANUAL_OUT", "DAMAGE", "LOST"]),

    quantity: z.number().min(1, "Quantity must be at least 1"),

    note: z.string().optional(),
  }),
});

export const inventoryLogQueryValidation = z.object({
  query: z.object({
    productId: z.string().optional(),
    variantId: z.string().optional(),
    sku: z.string().optional(),
    type: z
      .enum([
        "MANUAL_IN",
        "MANUAL_OUT",
        "DAMAGE",
        "LOST",
        "RETURN_RESTOCK",
        "ORDER_DEDUCT",
        "ORDER_CANCEL_RESTORE",
      ])
      .optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
