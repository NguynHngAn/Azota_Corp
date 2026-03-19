// Prefer `VITE_API_BASE_URL` (Vite-exposed), keep `API_BASE_URL` as a legacy fallback.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.API_BASE_URL ?? "";

export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

export const AUTH_TOKEN_KEY = "azota_access_token";
