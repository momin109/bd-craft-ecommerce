import { apiClient, unwrap } from "@/lib/api/client";
import { AuthUser, LoginPayload, LoginResponse } from "@/types/api/auth";

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post("/auth/login", payload);
    return unwrap<LoginResponse>(res);
  },

  getMe: async () => {
    const res = await apiClient.get("/users/me");
    return unwrap<AuthUser>(res);
  },
};
