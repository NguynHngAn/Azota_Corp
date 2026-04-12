import { get, post, put, del } from "@/api/client";
import { API_BASE_URL } from "@/utils/constants";

export type Role = "admin" | "teacher" | "student";

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  avatar_url?: string | null;
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
  email?: string;
  full_name?: string;
  role?: "teacher" | "student";
  is_active?: boolean;
}

export function listUsers(token: string, role?: "teacher" | "student"): Promise<UserResponse[]> {
  const query = role ? `?role=${role}` : "";
  return get<UserResponse[]>(`/api/v1/users${query}`, token);
}

export function createUser(body: UserCreatePayload, token: string): Promise<UserResponse> {
  return post<UserResponse>("/api/v1/users", body, token);
}

export function updateUser(userId: number, body: UserUpdatePayload, token: string): Promise<UserResponse> {
  return put<UserResponse>(`/api/v1/users/${userId}`, body, token);
}

export function deactivateUser(userId: number, token: string): Promise<void> {
  return del(`/api/v1/users/${userId}`, token);
}

export function resetUserPassword(userId: number, newPassword: string, token: string): Promise<void> {
  return put(`/api/v1/users/${userId}/password`, { new_password: newPassword }, token);
}

export function changeMyPassword(currentPassword: string, newPassword: string, token: string): Promise<void> {
  return put("/api/v1/users/me/password", { current_password: currentPassword, new_password: newPassword }, token);
}

export async function uploadMyAvatar(file: File, token: string): Promise<UserResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/v1/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    throw new Error(typeof detail === "string" ? detail : res.statusText);
  }
  return data as UserResponse;
}

