import { Types } from "mongoose";

export type TCategoryStatus = "ACTIVE" | "INACTIVE";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: Types.ObjectId;
  status: TCategoryStatus;
  sortOrder: number;
}
