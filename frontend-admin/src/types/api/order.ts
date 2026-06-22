export type OrderStatus = "PENDING" | "APPROVED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "COD" | "SSLCOMMERZ" | "AAMARPAY" | "SHURJOPAY";

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  district: string;
  city: string;
  area: string;
  addressLine: string;
  note?: string;
}

export interface AppliedOffer {
  code: string;
  title?: string;
  type: "FLASH_SALE" | "BUNDLE";
  discountAmount: number;
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  shippingCharge: number;
  discount?: number;
  couponCode?: string;
  customerNote?: string;
}

export interface ApiOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  sku?: string;
  size?: string;
  color?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ApiOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  invoiceNumber?: string;
  userId?: string;
  items: ApiOrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  isStockDeducted?: boolean;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  couponDiscount?: number;
  offerDiscount?: number;
  couponCode?: string;
  appliedOffers?: AppliedOffer[];
  totalPayable: number;
  customerNote?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface AdminOrderQuery {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export function getOrderId(order: ApiOrder): string {
  return order._id ?? order.id ?? "";
}
