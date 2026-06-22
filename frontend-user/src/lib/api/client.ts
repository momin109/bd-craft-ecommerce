import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const ACCESS_TOKEN_KEY = "shopora_access_token";

// Backend issues a single accessToken on login/register/verify-otp.
// There is no refresh-token endpoint in this contract, so we simply
// persist the access token and force re-login on 401.
export const tokenStorage = {
  getAccessToken: () => Cookies.get(ACCESS_TOKEN_KEY) || null,
  setAccessToken: (token: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 7, sameSite: "lax" });
  },
  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
  },
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// No silent refresh available — on 401, clear session and bounce to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Backend wraps every response as { success, message, data }
export function unwrap<T>(response: { data: any }): T {
  const body = response.data;
  if (body && typeof body === "object" && "data" in body) return body.data as T;
  return body as T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: { name?: string; stack?: string };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    if (error.message) return error.message;
  }
  return "Something went wrong. Please try again.";
}
