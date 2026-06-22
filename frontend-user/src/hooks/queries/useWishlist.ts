"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { useAuthContext } from "@/context/AuthContext";

export function useWishlist() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: () => wishlistService.getAll(),
    enabled: isAuthenticated,
  });
}

export function useWishlistCheck(productId: string) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.wishlist.check(productId),
    queryFn: () => wishlistService.check(productId),
    enabled: isAuthenticated && !!productId,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: string; isWishlisted: boolean }) => {
      if (isWishlisted) {
        await wishlistService.remove(productId);
      } else {
        await wishlistService.add(productId);
      }
      return { wishlisted: !isWishlisted };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all }),
  });
}
