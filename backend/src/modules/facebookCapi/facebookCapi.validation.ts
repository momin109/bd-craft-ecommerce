import { z } from "zod";

const contentValidation = z.object({
  id: z.string().min(1),
  quantity: z.number().min(1),
  item_price: z.number().min(0).optional(),
});

export const trackMetaEventValidation = z.object({
  body: z.object({
    eventName: z.enum([
      "ViewContent",
      "AddToCart",
      "InitiateCheckout",
      "Purchase",
    ]),

    eventId: z.string().optional(),

    eventSourceUrl: z.string().url().optional(),

    value: z.number().min(0).optional(),
    currency: z.literal("BDT").optional(),

    contentIds: z.array(z.string()).optional(),
    contentType: z.enum(["product", "product_group"]).optional(),
    contents: z.array(contentValidation).optional(),

    fbp: z.string().optional(),
    fbc: z.string().optional(),
  }),
});
