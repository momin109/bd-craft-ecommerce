"use client";
import { useMutation } from "@tanstack/react-query";
import { paymentService } from "@/services";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (orderId: string) => paymentService.initiate(orderId),
  });
}
