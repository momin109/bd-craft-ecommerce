import { IOrder } from "../order/order.interface.js";
import {
  TCourierProvider,
  TNormalizedDeliveryStatus,
} from "./courier.interface.js";

export type TCourierBookPayload = {
  provider: TCourierProvider;
  itemWeight?: number;
  itemDescription?: string;
  specialInstruction?: string;
};

export type TCourierCreatePayload = {
  order: IOrder;
  itemWeight: number;
  itemDescription?: string;
  specialInstruction?: string;
};

export type TCourierCreateResponse = {
  consignmentId?: string;
  trackingCode?: string;
  trackingUrl?: string;
  deliveryStatus: TNormalizedDeliveryStatus;
  courierStatusText?: string;
  charge?: number;
  rawResponse: unknown;
};

export type TCourierStatusResponse = {
  deliveryStatus: TNormalizedDeliveryStatus;
  courierStatusText?: string;
  rawResponse: unknown;
};
