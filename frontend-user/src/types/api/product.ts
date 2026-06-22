export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

export interface ProductVariant {
  _id?: string;
  id?: string;
  sku: string;
  size?: string;
  color?: string;
  colorCode?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAlert?: number;
  warehouse?: string;
}

export interface ApiCategoryRef {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
}

export interface ApiProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: ApiCategoryRef | string;
  brand?: string;
  images: string[];
  basePurchasePrice: number;
  baseSellingPrice: number;
  variants: ProductVariant[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: ProductStatus;
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  createdAt?: string;
}

export interface CreateProductPayload {
  name: string;
  shortDescription?: string;
  description: string;
  category: string;
  brand?: string;
  images: string[];
  basePurchasePrice: number;
  baseSellingPrice: number;
  variants: Omit<ProductVariant, "_id" | "id">[];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: ProductStatus;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "rating" | "bestseller";
  page?: number;
  limit?: number;
  inStock?: boolean;
}

export type StockAdjustType = "INCREASE" | "DECREASE";

export interface AdjustStockPayload {
  type: StockAdjustType;
  quantity: number;
  note?: string;
}

// Helper: derive a "display price" from variants for cards/listings
export function getProductDisplayPrice(product: ApiProduct): { price: number; originalPrice?: number } {
  const firstVariant = product.variants?.[0];
  if (firstVariant) {
    return {
      price: firstVariant.sellingPrice,
      originalPrice: firstVariant.purchasePrice < firstVariant.sellingPrice ? undefined : undefined,
    };
  }
  return { price: product.baseSellingPrice };
}

export function getProductTotalStock(product: ApiProduct): number {
  return (product.variants ?? []).reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

export function getProductId(product: ApiProduct): string {
  return product._id ?? product.id ?? "";
}

export function getVariantId(variant: ProductVariant): string {
  return variant._id ?? variant.id ?? "";
}

// Backend may return either a plain array or a paginated { items, meta } envelope
// depending on the endpoint/query — normalize so UI code never has to branch on this.
export function normalizeProductList(raw: unknown): ApiProduct[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray((raw as any).items)) return (raw as any).items;
  return [];
}
