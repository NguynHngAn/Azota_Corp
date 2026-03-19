import { get, post, put, del } from "./client";

export type Role = "admin" | "teacher" | "student";

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface UserCreatePayload {
  email: string;
  full_name: string;
  password: string;
  role: "teacher" | "student";
  is_active?: boolean;
}

export interface UserUpdatePayload {
  full_name?: string;
  role?: "teacher" | "student";
  is_active?: boolean;
}

export function listUsers(token: string, role?: "teacher" | "student"): Promise<UserResponse[]> {
  const query = role ? `?role=${role}` : "";
  return get<UserResponse[]>(`/users${query}`, token);
}

export function createUser(body: UserCreatePayload, token: string): Promise<UserResponse> {
  return post<UserResponse>("/users", body, token);
}

export function updateUser(userId: number, body: UserUpdatePayload, token: string): Promise<UserResponse> {
  return put<UserResponse>(`/users/${userId}`, body, token);
}

export function deactivateUser(userId: number, token: string): Promise<void> {
  return del(`/users/${userId}`, token);
}

