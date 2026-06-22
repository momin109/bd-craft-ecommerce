"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CreateCategoryPayload } from "@/types/api/category";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoryService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });
}

// Admin
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCategoryPayload> }) => categoryService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
}
