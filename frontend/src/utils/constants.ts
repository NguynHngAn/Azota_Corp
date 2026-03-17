export const API_BASE_URL = import.meta.env.API_BASE_URL ?? "";

export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

export const AUTH_TOKEN_KEY = "azota_access_token";
