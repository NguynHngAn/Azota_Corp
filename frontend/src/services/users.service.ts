import type { UserCreatePayload, UserResponse, UserUpdatePayload } from "./types";
import { createUser, deactivateUser, listUsers, updateUser } from "@/api/users";

export const usersService = {
  async list(token: string, role?: "teacher" | "student") {
    try {
      const data = await listUsers(token, role);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async create(body: UserCreatePayload, token: string) {
    try {
      const data = await createUser(body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async update(userId: number, body: UserUpdatePayload, token: string) {
    try {
      const data = await updateUser(userId, body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async deactivate(userId: number, token: string) {
    try {
      const data = await deactivateUser(userId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },
};

