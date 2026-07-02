import { ApiProduct, ProductVariant } from "./product";

export interface ApiCartItem {
  _id?: string;
  id?: string;

  // Backend কখনও productId দেয়, কখনও product string id দেয়
  productId?: string;
  product?: string | ApiProduct;

  variantId?: string;
  variant?: string | ProductVariant;

  quantity: number;

  // Flat cart snapshot fields from backend
  sku?: string;
  name?: string;
  image?: string;
  unitPrice?: number;
  itemTotal?: number;
  size?: string;
  color?: string;
  colorCode?: string;
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

export function getCartProductName(item: ApiCartItem): string {
  if (item.name) return item.name;

  if (typeof item.product === "object" && item.product?.name) {
    return item.product.name;
  }

  return "Product";
}

export function getCartProductImage(item: ApiCartItem): string | undefined {
  if (item.image) return item.image;

  if (typeof item.product === "object") {
    return item.product.images?.[0];
  }

  return undefined;
}

export function getCartProductHref(item: ApiCartItem): string {
  if (typeof item.product === "object" && item.product?.slug) {
    return `/products/${item.product.slug}`;
  }

  const productId =
    item.productId ??
    (typeof item.product === "string" ? item.product : item.product?._id);

  return productId ? `/products/${productId}` : "#";
}

export function getCartVariantSize(item: ApiCartItem): string | undefined {
  if (item.size) return item.size;

  if (typeof item.variant === "object") {
    return item.variant.size;
  }

  return undefined;
}

export function getCartVariantColor(item: ApiCartItem): string | undefined {
  if (item.color) return item.color;

  if (typeof item.variant === "object") {
    return item.variant.color;
  }

  return undefined;
}

export function getCartVariantColorCode(item: ApiCartItem): string | undefined {
  if (item.colorCode) return item.colorCode;

  if (typeof item.variant === "object") {
    return item.variant.colorCode;
  }

  return undefined;
}

export function getCartUnitPrice(item: ApiCartItem): number {
  if (typeof item.unitPrice === "number") return item.unitPrice;

  if (typeof item.variant === "object") {
    return item.variant.sellingPrice ?? 0;
  }

  return 0;
}

// import { ApiProduct, ProductVariant } from "./product";

// export interface ApiCartItem {
//   _id?: string;
//   id?: string;
//   productId: string;
//   variantId: string;
//   quantity: number;
//   product?: ApiProduct;
//   variant?: ProductVariant;
// }

// export interface ApiCart {
//   _id?: string;
//   items: ApiCartItem[];
//   subtotal?: number;
// }

// export interface AddToCartPayload {
//   productId: string;
//   variantId: string;
//   quantity: number;
// }

// export function getCartItemId(item: ApiCartItem): string {
//   return item._id ?? item.id ?? "";
// }
