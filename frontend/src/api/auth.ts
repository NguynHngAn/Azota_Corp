import { get, post } from "./client";

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

export function login(email: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>("/api/v1/auth/login", { email, password });
}

export function getMe(token: string): Promise<UserResponse> {
  return get<UserResponse>("/api/v1/users/me", token);
}
