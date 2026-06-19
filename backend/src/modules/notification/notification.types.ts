import {
  TNotificationChannel,
  TNotificationEvent,
} from "./notification.interface.js";

export type TNotificationAttachment = {
  filename: string;
  path?: string;
  content?: Buffer;
  contentType?: string;
};

export type TSendNotificationPayload = {
  channel: TNotificationChannel;
  event: TNotificationEvent;

  recipient: string;
  subject?: string;
  message: string;

  attachments?: TNotificationAttachment[];

  orderId?: string;
  customerId?: string;
};

export type TAdapterSendPayload = {
  recipient: string;
  subject?: string;
  message: string;
  attachments?: TNotificationAttachment[];
};

export type TAdapterSendResult = {
  skipped?: boolean;
  rawResponse?: unknown;
};
