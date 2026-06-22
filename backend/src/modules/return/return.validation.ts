import { z } from "zod";

const returnItemValidation = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),

  quantity: z.number().min(1),

  reason: z.enum([
    "DAMAGED",
    "WRONG_ITEM",
    "SIZE_ISSUE",
    "QUALITY_ISSUE",
    "CUSTOMER_CHANGED_MIND",
    "OTHER",
  ]),

  note: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

export const createReturnRequestValidation = z.object({
  body: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    customerNote: z.string().optional(),
    items: z
      .array(returnItemValidation)
      .min(1, "At least one item is required"),
  }),
});

export const updateReturnStatusValidation = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "RECEIVED", "CANCELLED"]),
    adminNote: z.string().optional(),
  }),
});

export const restockReturnValidation = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          returnItemId: z.string().min(1),
          quantity: z.number().min(1),
          restockable: z.boolean().default(true),
        }),
      )
      .min(1, "At least one return item is required"),

    adminNote: z.string().optional(),
  }),
});

export const refundReturnValidation = z.object({
  body: z.object({
    refundMethod: z.enum(["CASH", "BKASH", "NAGAD", "BANK", "STORE_CREDIT"]),
    refundAmount: z.number().min(0),
    refundTransactionId: z.string().optional(),
    adminNote: z.string().optional(),
  }),
});

export const returnQueryValidation = z.object({
  query: z.object({
    status: z
      .enum([
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "RECEIVED",
        "PARTIALLY_RESTOCKED",
        "RESTOCKED",
        "REFUNDED",
        "CANCELLED",
      ])
      .optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
