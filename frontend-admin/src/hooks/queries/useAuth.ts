"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import { LoginPayload } from "@/types/api/auth";

export function useLogin() {
  return useMutation({ mutationFn: (payload: LoginPayload) => authService.login(payload) });
}

export function useMe(enabled = true) {
  return useQuery({ queryKey: queryKeys.auth.me, queryFn: () => authService.getMe(), enabled, retry: false });
}
