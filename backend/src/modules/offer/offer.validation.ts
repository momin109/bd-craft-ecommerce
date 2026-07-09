import { z } from "zod";
import { Types } from "mongoose";

const objectIdString = z
  .string()
  .trim()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid MongoDB ObjectId",
  });

const optionalObjectIdString = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, objectIdString.optional());

const optionalUrlString = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.string().trim().url().optional());

const dateString = z
  .string()
  .trim()
  .refine(
    (value) => {
      return !Number.isNaN(new Date(value).getTime());
    },
    {
      message: "Invalid date",
    },
  );

const moneyNumber = z.coerce.number().min(1, "Amount must be greater than 0");

const zeroOrPositiveNumber = z.coerce.number().min(0);

const positiveInt = z.coerce
  .number()
  .int("Value must be an integer")
  .min(1, "Value must be at least 1");

const offerStatusValidation = z.enum([
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "INACTIVE",
]);

const flashSaleItemStatusValidation = z.enum(["ACTIVE", "INACTIVE"]);

const flashSaleItemValidation = z.object({
  product: objectIdString,
  variantId: optionalObjectIdString,

  regularPrice: zeroOrPositiveNumber.optional(),
  flashPrice: moneyNumber,

  stockLimit: positiveInt.optional(),
  perUserLimit: positiveInt.optional(),

  status: flashSaleItemStatusValidation.optional(),
});

const bundleItemValidation = z.object({
  product: objectIdString,
  variantId: optionalObjectIdString,
  quantity: positiveInt,
});

const bundleValidation = z.object({
  items: z.array(bundleItemValidation).min(2, "Bundle needs at least 2 items"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: moneyNumber,
  maxDiscount: zeroOrPositiveNumber.optional(),
});

export const createOfferValidation = z
  .object({
    body: z.object({
      code: z.string().trim().min(2, "Offer code is required"),
      title: z.string().trim().min(2, "Offer title is required"),
      description: z.string().trim().optional(),

      type: z.enum(["FLASH_SALE", "BUNDLE"]),

      startDate: dateString,
      endDate: dateString,

      usageLimit: positiveInt.optional(),
      priority: z.coerce.number().int().default(0),

      bannerImage: optionalUrlString,

      flashSaleItems: z.array(flashSaleItemValidation).optional(),

      bundle: bundleValidation.optional(),

      status: offerStatusValidation.optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const body = data.body;

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "endDate"],
        message: "End date must be greater than start date",
      });
    }

    if (body.type === "FLASH_SALE") {
      if (!body.flashSaleItems || body.flashSaleItems.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "flashSaleItems"],
          message: "Flash sale needs at least one product",
        });
      }

      const itemKeys = new Set<string>();

      for (const [index, item] of (body.flashSaleItems || []).entries()) {
        const key = `${item.product}:${item.variantId || ""}`;

        if (itemKeys.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "flashSaleItems", index, "product"],
            message: "Duplicate product/variant in flash sale items",
          });
        }

        itemKeys.add(key);

        if (
          typeof item.regularPrice === "number" &&
          item.regularPrice > 0 &&
          item.flashPrice >= item.regularPrice
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "flashSaleItems", index, "flashPrice"],
            message: "Flash price must be lower than regular price",
          });
        }

        if (
          item.stockLimit &&
          item.perUserLimit &&
          item.perUserLimit > item.stockLimit
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "flashSaleItems", index, "perUserLimit"],
            message: "Per user limit cannot be greater than stock limit",
          });
        }
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

      if (
        body.bundle?.discountType === "PERCENTAGE" &&
        body.bundle.discountValue > 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "bundle", "discountValue"],
          message: "Percentage discount cannot be more than 100",
        });
      }
    }
  });

export const updateOfferValidation = z
  .object({
    body: z.object({
      title: z.string().trim().min(2).optional(),
      description: z.string().trim().optional(),

      startDate: dateString.optional(),
      endDate: dateString.optional(),

      usageLimit: positiveInt.optional(),
      priority: z.coerce.number().int().optional(),

      bannerImage: optionalUrlString,

      flashSaleItems: z.array(flashSaleItemValidation).optional(),

      bundle: bundleValidation.optional(),

      status: offerStatusValidation.optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const body = data.body;

    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);

      if (endDate <= startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["body", "endDate"],
          message: "End date must be greater than start date",
        });
      }
    }

    if (body.flashSaleItems) {
      const itemKeys = new Set<string>();

      for (const [index, item] of body.flashSaleItems.entries()) {
        const key = `${item.product}:${item.variantId || ""}`;

        if (itemKeys.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "flashSaleItems", index, "product"],
            message: "Duplicate product/variant in flash sale items",
          });
        }

        itemKeys.add(key);

        if (
          typeof item.regularPrice === "number" &&
          item.regularPrice > 0 &&
          item.flashPrice >= item.regularPrice
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "flashSaleItems", index, "flashPrice"],
            message: "Flash price must be lower than regular price",
          });
        }

        if (
          item.stockLimit &&
          item.perUserLimit &&
          item.perUserLimit > item.stockLimit
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "flashSaleItems", index, "perUserLimit"],
            message: "Per user limit cannot be greater than stock limit",
          });
        }
      }
    }

    if (
      body.bundle?.discountType === "PERCENTAGE" &&
      body.bundle.discountValue > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "bundle", "discountValue"],
        message: "Percentage discount cannot be more than 100",
      });
    }
  });

export const cartOfferPreviewValidation = z.object({
  query: z.object({
    couponCode: z.string().trim().optional(),
  }),
});
