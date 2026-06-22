import { apiClient, unwrap } from "@/lib/api/client";
import { ApiCategory, CreateCategoryPayload } from "@/types/api/category";

export const categoryService = {
  getAll: async () => {
    const res = await apiClient.get("/categories");
    return unwrap<ApiCategory[]>(res);
  },

  getBySlug: async (slug: string) => {
    const res = await apiClient.get(`/categories/${slug}`);
    return unwrap<ApiCategory>(res);
  },

  // Admin
  create: async (payload: CreateCategoryPayload) => {
    const res = await apiClient.post("/categories", payload);
    return unwrap<ApiCategory>(res);
  },

  update: async (id: string, payload: Partial<CreateCategoryPayload>) => {
    const res = await apiClient.patch(`/categories/${id}`, payload);
    return unwrap<ApiCategory>(res);
  },

  remove: async (id: string) => {
    const res = await apiClient.delete(`/categories/${id}`);
    return unwrap<{ message: string }>(res);
  },
};
