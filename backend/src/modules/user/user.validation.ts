import { z } from "zod";

const bdMobileRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const updateMyProfileValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    avatar: z.string().url().optional(),

    address: z
      .object({
        district: z.string().optional(),
        city: z.string().optional(),
        area: z.string().optional(),
        addressLine: z.string().optional(),
      })
      .optional(),
  }),
});

export const changePasswordValidation = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});

export const adminCustomerQueryValidation = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["ACTIVE", "BLOCKED", "DELETED"]).optional(),
    codAllowed: z.enum(["true", "false"]).optional(),
    minSuccessRate: z.string().optional(),
    maxSuccessRate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const updateCustomerCodValidation = z.object({
  body: z.object({
    codAllowed: z.boolean(),
    adminNote: z.string().optional(),
  }),
});

export const updateCustomerStatusValidation = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "BLOCKED"]),
    adminNote: z.string().optional(),
  }),
});

export const updateCustomerNoteValidation = z.object({
  body: z.object({
    adminNote: z.string().min(1, "Admin note is required"),
  }),
});

export const updateCustomerByAdminValidation = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    mobile: z.string().regex(bdMobileRegex).optional(),
    email: z.string().email().optional(),
    address: z
      .object({
        district: z.string().optional(),
        city: z.string().optional(),
        area: z.string().optional(),
        addressLine: z.string().optional(),
      })
      .optional(),
    adminNote: z.string().optional(),
  }),
});
