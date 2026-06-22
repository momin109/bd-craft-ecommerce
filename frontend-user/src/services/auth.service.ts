import { apiClient, unwrap } from "@/lib/api/client";
import {
  AuthUser, RegisterPayload, RegisterResponse, LoginPayload, LoginResponse,
  VerifyOtpPayload, UpdateProfilePayload, ChangePasswordPayload,
} from "@/types/api/auth";

export const authService = {
  register: async (payload: RegisterPayload) => {
    const res = await apiClient.post("/auth/register", payload);
    return unwrap<RegisterResponse>(res);
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    const res = await apiClient.post("/auth/verify-otp", payload);
    return unwrap<{ message: string }>(res);
  },

  login: async (payload: LoginPayload) => {
    const res = await apiClient.post("/auth/login", payload);
    return unwrap<LoginResponse>(res);
  },

  getMe: async () => {
    const res = await apiClient.get("/users/me");
    return unwrap<AuthUser>(res);
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const res = await apiClient.patch("/users/me", payload);
    return unwrap<AuthUser>(res);
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const res = await apiClient.patch("/users/me/change-password", payload);
    return unwrap<{ message: string }>(res);
  },
};
