import { apiClient, unwrap } from "@/lib/api/client";
import { ApiProduct, ProductQueryParams, CreateProductPayload, AdjustStockPayload } from "@/types/api/product";
import { PaginatedResponse } from "@/types/api/common";

export const productService = {
  getAll: async (params: ProductQueryParams = {}) => {
    const res = await apiClient.get("/products", { params });
    return unwrap<PaginatedResponse<ApiProduct> | ApiProduct[]>(res);
  },

  getBySlug: async (slug: string) => {
    const res = await apiClient.get(`/products/${slug}`);
    return unwrap<ApiProduct>(res);
  },

  search: async (keyword: string) => {
    const res = await apiClient.get("/products", { params: { search: keyword } });
    return unwrap<PaginatedResponse<ApiProduct> | ApiProduct[]>(res);
  },

  // Admin
  create: async (payload: CreateProductPayload) => {
    const res = await apiClient.post("/products", payload);
    return unwrap<ApiProduct>(res);
  },

  update: async (id: string, payload: Partial<CreateProductPayload>) => {
    const res = await apiClient.patch(`/products/${id}`, payload);
    return unwrap<ApiProduct>(res);
  },

  remove: async (id: string) => {
    const res = await apiClient.delete(`/products/${id}`);
    return unwrap<{ message: string }>(res);
  },

  adjustVariantStock: async (productId: string, variantId: string, payload: AdjustStockPayload) => {
    const res = await apiClient.patch(`/products/${productId}/variants/${variantId}/stock`, payload);
    return unwrap<ApiProduct>(res);
  },
};
