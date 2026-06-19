import { Types } from "mongoose";

export type TMetaEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export type TMetaEventStatus = "SENT" | "FAILED" | "SKIPPED";

export interface IFacebookCapiEventLog {
  eventName: TMetaEventName;
  eventId: string;

  customer?: Types.ObjectId;
  order?: Types.ObjectId;

  eventSourceUrl?: string;
  actionSource: "website";

  value?: number;
  currency: "BDT";

  contentIds: string[];
  contentType: "product" | "product_group";
  contents: {
    id: string;
    quantity: number;
    item_price?: number;
  }[];

  status: TMetaEventStatus;

  requestPayload?: unknown;
  responsePayload?: unknown;
  errorMessage?: string;

  sentAt?: Date;
}
