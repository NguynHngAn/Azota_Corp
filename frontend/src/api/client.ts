import { API_BASE_URL } from "../utils/constants";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = Array.isArray(detail) ? detail.map((d: { msg?: string }) => d.msg).join(", ") : (detail ?? res.statusText);
    throw new Error(typeof msg === "string" ? msg : res.statusText);
  }
  return data as T;
}

export async function get<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "GET", token });
}

export async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body), token });
}

export async function put<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body), token });
}

export async function del<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "DELETE", token });
}
