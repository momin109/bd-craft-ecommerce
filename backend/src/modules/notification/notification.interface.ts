import { Types } from "mongoose";

export type TNotificationChannel = "SMS" | "EMAIL" | "WHATSAPP";

export type TNotificationStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export type TNotificationEvent =
  | "ORDER_PLACED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "COURIER_BOOKED"
  | "ORDER_STATUS_UPDATED"
  | "ORDER_DELIVERED"
  | "ORDER_RETURNED"
  | "CUSTOM";

export interface INotificationLog {
  channel: TNotificationChannel;
  event: TNotificationEvent;

  recipient: string;
  subject?: string;
  message: string;

  status: TNotificationStatus;

  provider?: string;

  order?: Types.ObjectId;
  customer?: Types.ObjectId;

  errorMessage?: string;
  rawResponse?: unknown;

  sentAt?: Date;
}
