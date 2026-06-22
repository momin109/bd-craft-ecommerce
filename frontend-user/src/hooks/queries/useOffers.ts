"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { offerService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CreateOfferPayload } from "@/types/api/offer";

export function useActiveOffers() {
  return useQuery({ queryKey: queryKeys.offers.active, queryFn: () => offerService.getActive() });
}

export function useCartOfferPreview(enabled = true) {
  return useQuery({
    queryKey: queryKeys.offers.cartPreview,
    queryFn: () => offerService.cartPreview(),
    enabled,
  });
}

// Admin
export function useAdminOffers() {
  return useQuery({ queryKey: queryKeys.offers.adminAll, queryFn: () => offerService.getAll() });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offerService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers.adminAll }),
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateOfferPayload> }) => offerService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers.adminAll }),
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offerService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers.adminAll }),
  });
}
