"use client";

import { useQuery } from "@tanstack/react-query";
import { offerService } from "@/services/offer.service";

export function useActiveOffers() {
  return useQuery({
    queryKey: ["active-offers"],
    queryFn: () => offerService.getActiveOffers(),
  });
}
