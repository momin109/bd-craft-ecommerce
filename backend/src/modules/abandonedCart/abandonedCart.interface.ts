import { Types } from "mongoose";

export type TAbandonedCartStatus = "SENT" | "FAILED" | "SKIPPED";

export interface IAbandonedCartLog {
  customer: Types.ObjectId;
  cart: Types.ObjectId;

  cartSubtotal: number;
  totalItems: number;

  couponCode?: string;

  message: string;

  status: TAbandonedCartStatus;

  sentChannels: string[];

  errorMessage?: string;

  sentAt?: Date;
}
