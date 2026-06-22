export type NotificationChannel = "SMS" | "EMAIL" | "WHATSAPP";
export type NotificationStatus = "SENT" | "FAILED" | "SKIPPED" | "PENDING";

export interface SendNotificationPayload {
  channel: NotificationChannel;
  recipient: string;
  message: string;
  subject?: string;
}

export interface NotificationLog {
  _id?: string;
  id?: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
  subject?: string;
  status: NotificationStatus;
  event?: string;
  createdAt: string;
}

export interface NotificationLogQuery {
  channel?: NotificationChannel;
  status?: NotificationStatus;
  event?: string;
  page?: number;
}
