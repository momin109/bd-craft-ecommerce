"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { AddToCartPayload } from "@/types/api/cart";
import { useAuthContext } from "@/context/AuthContext";

export function useCart() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      cartService.updateItem(cartItemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeItem(cartItemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  });
}
