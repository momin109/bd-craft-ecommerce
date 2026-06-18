import { Types } from "mongoose";

export interface ICartItem {
  _id?: Types.ObjectId;

  product: Types.ObjectId;
  variantId: Types.ObjectId;

  sku: string;
  name: string;
  image?: string;

  size?: string;
  color?: string;

  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];

  totalItems: number;
  subtotal: number;
}
