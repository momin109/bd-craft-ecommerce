import { z } from "zod";

export const bookCourierValidation = z.object({
  body: z.object({
    provider: z.enum(["STEADFAST", "PATHAO"]),
    itemWeight: z.number().min(0.1).default(1),
    itemDescription: z.string().optional(),
    specialInstruction: z.string().optional(),
  }),
});

export const syncCourierValidation = z.object({
  params: z.object({
    shipmentId: z.string().min(1, "Shipment ID is required"),
  }),
});
