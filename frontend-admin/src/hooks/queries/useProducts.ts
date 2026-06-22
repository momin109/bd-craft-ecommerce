"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { ProductQueryParams, CreateProductPayload, AdjustStockPayload } from "@/types/api/product";

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({ queryKey: queryKeys.products.all(params), queryFn: () => productService.getAll(params) });
}

export function useProduct(id: string) {
  return useQuery({ queryKey: queryKeys.products.detail(id), queryFn: () => productService.getBySlug(id), enabled: !!id });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductPayload> }) => productService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAdjustVariantStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, variantId, payload }: { productId: string; variantId: string; payload: AdjustStockPayload }) =>
      productService.adjustVariantStock(productId, variantId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
