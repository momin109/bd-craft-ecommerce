export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export interface CustomerAddress {
  district?: string;
  city?: string;
  area?: string;
  addressLine?: string;
}

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  isMobileVerified: boolean;
  codAllowed?: boolean;
  address?: CustomerAddress;
}

export interface RegisterPayload {
  name: string;
  mobile: string;
  email?: string;
  password: string;
}

export interface RegisterResponse {
  user: AuthUser;
  otpForDevelopment?: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
}

export interface LoginPayload {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
  address?: CustomerAddress;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
