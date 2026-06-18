import { z } from "zod";

export const reportQueryValidation = z.object({
  query: z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),

    groupBy: z.enum(["day", "week", "month"]).optional(),

    status: z
      .enum([
        "PENDING",
        "APPROVED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "RETURNED",
        "CANCELLED",
      ])
      .optional(),

    paymentMethod: z
      .enum(["COD", "SSLCOMMERZ", "AAMARPAY", "SHURJOPAY"])
      .optional(),

    provider: z.enum(["STEADFAST", "PATHAO", "MANUAL", "NONE"]).optional(),

    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
