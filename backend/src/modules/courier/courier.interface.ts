import { Types } from "mongoose";

export type TCourierProvider = "STEADFAST" | "PATHAO";

export type TCourierBookingStatus =
  | "PENDING"
  | "BOOKED"
  | "FAILED"
  | "CANCELLED";

export type TNormalizedDeliveryStatus =
  | "PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "PARTIAL_DELIVERED"
  | "RETURNED"
  | "CANCELLED"
  | "UNKNOWN";

export interface ICourierShipment {
  order: Types.ObjectId;
  orderNumber: string;

  provider: TCourierProvider;

  bookingStatus: TCourierBookingStatus;

  consignmentId?: string;
  trackingCode?: string;
  trackingUrl?: string;

  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district: string;
  city?: string;
  area?: string;

  codAmount: number;
  itemWeight: number;
  itemDescription?: string;
  specialInstruction?: string;

  deliveryStatus: TNormalizedDeliveryStatus;
  courierStatusText?: string;

  charge?: number;

  rawCreateResponse?: unknown;
  rawStatusResponse?: unknown;
  errorMessage?: string;

  bookedBy?: Types.ObjectId;
  bookedAt?: Date;
  lastSyncedAt?: Date;
}
