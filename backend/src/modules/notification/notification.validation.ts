import { z } from "zod";

export const customNotificationValidation = z.object({
  body: z.object({
    channel: z.enum(["SMS", "EMAIL", "WHATSAPP"]),
    recipient: z.string().min(1, "Recipient is required"),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    orderId: z.string().optional(),
    customerId: z.string().optional(),
  }),
});
