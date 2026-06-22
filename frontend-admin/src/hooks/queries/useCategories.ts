"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CreateCategoryPayload } from "@/types/api/category";

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories.all, queryFn: () => categoryService.getAll() });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCategoryPayload> }) => categoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}
