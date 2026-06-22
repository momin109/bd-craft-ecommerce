"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { ProductQueryParams, CreateProductPayload, AdjustStockPayload } from "@/types/api/product";

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.all(params),
    queryFn: () => productService.getAll(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useProductSearch(keyword: string) {
  return useQuery({
    queryKey: queryKeys.products.search(keyword),
    queryFn: () => productService.search(keyword),
    enabled: keyword.length > 0,
  });
}

// Admin
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) => productService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAdjustVariantStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId, payload }: { productId: string; variantId: string; payload: AdjustStockPayload }) =>
      productService.adjustVariantStock(productId, variantId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
