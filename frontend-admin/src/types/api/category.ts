export interface ApiCategory {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  productCount?: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}

export function getCategoryId(cat: ApiCategory): string {
  return cat._id ?? cat.id ?? "";
}
