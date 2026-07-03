import { ApiProduct } from "./product";

export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

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
  _id?: string;

  // Backend real fields
  product?: string | ApiProduct;
  variantId?: string;
  sku?: string;
  name?: string;
  image?: string;
  size?: string;
  color?: string;
  colorCode?: string;
  unitPrice?: number;
  quantity: number;
  itemTotal?: number;
  purchasePrice?: number;
  profit?: number;

  // Frontend legacy/fallback fields
  productId?: string;
  productName?: string;
  price?: number;
  subtotal?: number;
}

export interface OrderStatusLog {
  status: OrderStatus;
  note?: string;
  changedBy?: string;
  changedAt?: string;
}

export interface OrderCourier {
  provider?: string;
  trackingId?: string;
  trackingUrl?: string;
}

export interface ApiOrder {
  _id?: string;
  id?: string;

  orderNumber: string;
  invoiceNumber?: string;

  customer?: string;
  userId?: string;

  items: ApiOrderItem[];

  shippingAddress: ShippingAddress;

  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  statusLogs?: OrderStatusLog[];

  subtotal: number;
  shippingCharge: number;
  couponDiscount?: number;
  offerDiscount?: number;
  discount: number;

  appliedOffers?: AppliedOffer[];

  totalPayable: number;
  totalPurchaseCost?: number;
  totalProfit?: number;

  courier?: OrderCourier;

  isStockDeducted?: boolean;
  orderFingerprint?: string;

  couponCode?: string;
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

export function getOrderItemId(item: ApiOrderItem, index?: number): string {
  return item._id ?? item.variantId ?? item.sku ?? String(index ?? "");
}

export function getOrderItemProductId(item: ApiOrderItem): string {
  if (item.productId) return item.productId;

  if (typeof item.product === "string") {
    return item.product;
  }

  if (typeof item.product === "object" && item.product?._id) {
    return item.product._id;
  }

  return "";
}

export function getOrderItemName(item: ApiOrderItem): string {
  if (item.name) return item.name;
  if (item.productName) return item.productName;

  if (typeof item.product === "object" && item.product?.name) {
    return item.product.name;
  }

  return "Product";
}

export function getOrderItemImage(item: ApiOrderItem): string | undefined {
  if (item.image) return item.image;

  if (typeof item.product === "object") {
    return item.product.images?.[0];
  }

  return undefined;
}

export function getOrderItemUnitPrice(item: ApiOrderItem): number {
  if (typeof item.unitPrice === "number") return item.unitPrice;
  if (typeof item.price === "number") return item.price;

  if (
    typeof item.itemTotal === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  ) {
    return item.itemTotal / item.quantity;
  }

  return 0;
}

export function getOrderItemTotal(item: ApiOrderItem): number {
  if (typeof item.itemTotal === "number") return item.itemTotal;
  if (typeof item.subtotal === "number") return item.subtotal;

  return getOrderItemUnitPrice(item) * item.quantity;
}

// export type OrderStatus = "PENDING" | "APPROVED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "RETURNED" | "CANCELLED";
// export type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
// export type PaymentMethod = "COD" | "SSLCOMMERZ" | "AAMARPAY" | "SHURJOPAY";

// export interface ShippingAddress {
//   fullName: string;
//   mobile: string;
//   district: string;
//   city: string;
//   area: string;
//   addressLine: string;
//   note?: string;
// }

// export interface AppliedOffer {
//   code: string;
//   title?: string;
//   type: "FLASH_SALE" | "BUNDLE";
//   discountAmount: number;
// }

// export interface CheckoutPayload {
//   shippingAddress: ShippingAddress;
//   paymentMethod: PaymentMethod;
//   shippingCharge: number;
//   discount?: number;
//   couponCode?: string;
//   customerNote?: string;
// }

// export interface ApiOrderItem {
//   productId: string;
//   variantId: string;
//   productName: string;
//   sku?: string;
//   size?: string;
//   color?: string;
//   image?: string;
//   price: number;
//   quantity: number;
//   subtotal: number;
// }

// export interface ApiOrder {
//   _id?: string;
//   id?: string;
//   orderNumber: string;
//   invoiceNumber?: string;
//   userId?: string;
//   items: ApiOrderItem[];
//   shippingAddress: ShippingAddress;
//   paymentMethod: PaymentMethod;
//   orderStatus: OrderStatus;
//   paymentStatus: PaymentStatus;
//   isStockDeducted?: boolean;
//   subtotal: number;
//   shippingCharge: number;
//   discount: number;
//   couponDiscount?: number;
//   offerDiscount?: number;
//   couponCode?: string;
//   appliedOffers?: AppliedOffer[];
//   totalPayable: number;
//   customerNote?: string;
//   adminNote?: string;
//   createdAt: string;
//   updatedAt?: string;
// }

// export interface UpdateOrderStatusPayload {
//   status: OrderStatus;
//   note?: string;
// }

// export interface AdminOrderQuery {
//   status?: OrderStatus;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export function getOrderId(order: ApiOrder): string {
//   return order._id ?? order.id ?? "";
// }
