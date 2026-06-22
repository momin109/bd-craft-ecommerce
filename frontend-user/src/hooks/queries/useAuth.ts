"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services";
import { queryKeys } from "@/lib/api/queryClient";
import {
  RegisterPayload, LoginPayload, VerifyOtpPayload, UpdateProfilePayload, ChangePasswordPayload,
} from "@/types/api/auth";

export function useRegister() {
  return useMutation({ mutationFn: (payload: RegisterPayload) => authService.register(payload) });
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload) });
}

export function useLogin() {
  return useMutation({ mutationFn: (payload: LoginPayload) => authService.login(payload) });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authService.getMe(),
    enabled,
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload) });
}
