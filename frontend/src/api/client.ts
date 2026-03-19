import { AUTH_TOKEN_KEY, API_BASE_URL } from "@/utils/constants";

function normalizeErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const maybeDetail = (payload as { detail?: unknown }).detail;
  if (typeof maybeDetail === "string") return maybeDetail;
  if (Array.isArray(maybeDetail)) {
    const msgs = maybeDetail
      .map((d) =>
        d && typeof d === "object" ? (d as { msg?: unknown }).msg : undefined,
      )
      .filter((m): m is string => typeof m === "string");
    if (msgs.length) return msgs.join(", ");
  }
  return fallback;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options: { body?: unknown; token?: string } = {},
): Promise<T> {
  const baseUrl = String(API_BASE_URL ?? "").replace(/\/+$/, "");
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (options.token) {
    (headers as Record<string, string>).Authorization =
      `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = res.status === 204 ? null : await res.json().catch(() => null);

  if (res.status === 401) {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent("auth:logout"));
    } catch {
      // ignore storage/event failures
    }
  }

  if (!res.ok) {
    throw new Error(normalizeErrorMessage(payload, res.statusText));
  }

  return payload as T;
}

export async function get<T>(path: string, token?: string): Promise<T> {
  return request<T>("GET", path, { token });
}

export async function post<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return request<T>("POST", path, { body, token });
}

export async function put<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return request<T>("PUT", path, { body, token });
}

export async function del<T>(path: string, token?: string): Promise<T> {
  return request<T>("DELETE", path, { token });
}
