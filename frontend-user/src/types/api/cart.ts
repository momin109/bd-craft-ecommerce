import { ApiProduct, ProductVariant } from "./product";

export interface ApiCartItem {
  _id?: string;
  id?: string;
  productId: string;
  variantId: string;
  quantity: number;
  product?: ApiProduct;
  variant?: ProductVariant;
}

export interface ApiCart {
  _id?: string;
  items: ApiCartItem[];
  subtotal?: number;
}

export interface AddToCartPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

export function getCartItemId(item: ApiCartItem): string {
  return item._id ?? item.id ?? "";
}
