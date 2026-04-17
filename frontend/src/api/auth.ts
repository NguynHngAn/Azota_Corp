import { get, post } from "@/api/client";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "teacher" | "student";
  is_active: boolean;
  avatar_url?: string | null;
  created_at: string;
}

export function login(email: string, password: string, rememberMe = true): Promise<LoginResponse> {
  return post<LoginResponse>("/api/v1/auth/login", {
    email,
    password,
    remember_me: rememberMe,
  });
}

export function refreshWithToken(refreshToken: string): Promise<LoginResponse> {
  return post<LoginResponse>("/api/v1/auth/refresh", { refresh_token: refreshToken });
}

export function getMe(token: string): Promise<UserResponse> {
  return get<UserResponse>("/api/v1/users/me", token);
}

export interface PasswordResetRequestedResponse {
  message: string;
}

export function requestPasswordReset(email: string): Promise<PasswordResetRequestedResponse> {
  return post<PasswordResetRequestedResponse>("/api/v1/auth/request-password-reset", { email });
}

export function resetPassword(token: string, new_password: string): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>("/api/v1/auth/reset-password", { token, new_password });
}
