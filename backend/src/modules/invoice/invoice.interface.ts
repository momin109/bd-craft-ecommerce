import { Types } from "mongoose";

export type TInvoiceStatus = "GENERATED" | "EMAILED" | "FAILED";

export interface IInvoice {
  order: Types.ObjectId;
  customer: Types.ObjectId;

  orderNumber: string;
  invoiceNumber: string;

  pdfPath: string;
  pdfUrl: string;

  subtotal: number;
  shippingCharge: number;
  discount: number;
  totalPayable: number;

  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;

  status: TInvoiceStatus;

  emailSentAt?: Date;
  errorMessage?: string;
}
