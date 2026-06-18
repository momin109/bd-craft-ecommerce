import {
  TNotificationChannel,
  TNotificationEvent,
} from "./notification.interface.js";

export type TSendNotificationPayload = {
  channel: TNotificationChannel;
  event: TNotificationEvent;

  recipient: string;
  subject?: string;
  message: string;

  orderId?: string;
  customerId?: string;
};

export type TAdapterSendPayload = {
  recipient: string;
  subject?: string;
  message: string;
};

export type TAdapterSendResult = {
  skipped?: boolean;
  rawResponse?: unknown;
};
