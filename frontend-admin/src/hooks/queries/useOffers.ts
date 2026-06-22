"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { offerService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { CreateOfferPayload } from "@/types/api/offer";

export function useOffers() {
  return useQuery({ queryKey: queryKeys.offers.all, queryFn: () => offerService.getAll() });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offerService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.offers.all }),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateOfferPayload> }) => offerService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.offers.all }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offerService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.offers.all }),
  });
}
