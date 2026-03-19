import type { TokenResponse, UserResponse } from "./types";
import { login as apiLogin, getMe } from "@/api/auth";

export const authService = {
  async login(email: string, password: string) {
    try {
      const data = await apiLogin(email, password);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Login failed", data: null };
    }
  },

  async refresh(_refreshToken: string) {
    return {
      success: false as const,
      message: "Refresh is not implemented in src/api yet",
      data: null,
    };
  },

  async me(token?: string | null) {
    if (!token) return { success: false as const, message: "Missing token", data: null };
    try {
      const data = await getMe(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed to load profile", data: null };
    }
  },
};

