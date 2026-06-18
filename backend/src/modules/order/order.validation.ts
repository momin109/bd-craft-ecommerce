import { z } from "zod";

const bdMobileRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

const shippingAddressValidation = z.object({
  fullName: z.string().min(2, "Full name is required"),
  mobile: z.string().regex(bdMobileRegex, "Invalid Bangladeshi mobile number"),
  district: z.string().min(2, "District is required"),
  city: z.string().optional(),
  area: z.string().optional(),
  addressLine: z.string().min(5, "Full address is required"),
  note: z.string().optional(),
});

export const checkoutValidation = z.object({
  body: z.object({
    shippingAddress: shippingAddressValidation,

    paymentMethod: z.enum(["COD", "SSLCOMMERZ", "AAMARPAY", "SHURJOPAY"]),

    shippingCharge: z.number().min(0).default(0),

    couponCode: z.string().optional(),

    customerNote: z.string().optional(),
  }),
});

export const updateOrderStatusValidation = z.object({
  body: z.object({
    status: z.enum([
      "APPROVED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "RETURNED",
      "CANCELLED",
    ]),
    note: z.string().optional(),
  }),
});

export const orderQueryValidation = z.object({
  query: z.object({
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
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
