import { Types } from "mongoose";

export type TProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export interface IProductVariant {
  _id?: Types.ObjectId;
  sku: string;
  size?: string;
  color?: string;
  colorCode?: string;

  purchasePrice: number;
  sellingPrice: number;

  stock: number;
  lowStockAlert: number;

  warehouse?: string;
  isActive: boolean;
}

export interface IProduct {
  name: string;
  slug: string;

  shortDescription?: string;
  description?: string;

  category: Types.ObjectId;
  brand?: string;

  images: string[];

  basePurchasePrice: number;
  baseSellingPrice: number;

  variants: IProductVariant[];

  totalStock: number;

  tags: string[];

  metaTitle?: string;
  metaDescription?: string;

  averageRating: number;
  reviewCount: number;

  status: TProductStatus;
}
