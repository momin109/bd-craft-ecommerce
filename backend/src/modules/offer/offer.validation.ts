import { z } from "zod";

const objectIdString = z.string().min(1);

const flashSaleItemValidation = z.object({
  product: objectIdString,
  variantId: objectIdString.optional(),
  flashPrice: z.number().min(0),
  stockLimit: z.number().min(1).optional(),
});

const bundleItemValidation = z.object({
  product: objectIdString,
  variantId: objectIdString.optional(),
  quantity: z.number().min(1),
});

const bundleValidation = z.object({
  items: z.array(bundleItemValidation).min(2, "Bundle needs at least 2 items"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0),
  maxDiscount: z.number().min(0).optional(),
});

export const createOfferValidation = z
  .object({
    body: z.object({
      code: z.string().min(2, "Offer code is required"),
      title: z.string().min(2, "Offer title is required"),
      description: z.string().optional(),

      type: z.enum(["FLASH_SALE", "BUNDLE"]),

      startDate: z.string().datetime(),
      endDate: z.string().datetime(),

      usageLimit: z.number().min(1).optional(),
      priority: z.number().default(0),

      flashSaleItems: z.array(flashSaleItemValidation).optional(),

      bundle: bundleValidation.optional(),

      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const body = data.body;

    if (body.type === "FLASH_SALE") {
      if (!body.flashSaleItems || body.flashSaleItems.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "flashSaleItems"],
          message: "Flash sale needs at least one product",
        });
      }
    }

    if (body.type === "BUNDLE") {
      if (!body.bundle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "bundle"],
          message: "Bundle offer data is required",
        });
      }
    }
  });

export const updateOfferValidation = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),

    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),

    usageLimit: z.number().min(1).optional(),
    priority: z.number().optional(),

    flashSaleItems: z.array(flashSaleItemValidation).optional(),

    bundle: bundleValidation.optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const cartOfferPreviewValidation = z.object({
  body: z.object({
    couponCode: z.string().optional(),
  }),
});
