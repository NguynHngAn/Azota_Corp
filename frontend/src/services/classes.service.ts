import type { ClassDetail, ClassMemberResponse, ClassResponse } from "./types";
import {
  createClass,
  getClass,
  joinClass,
  listClasses,
  listMembers,
  listMyClasses,
  removeMember,
  updateClassTeacher,
} from "@/api/classes";

export const classesService = {
  async list(token: string) {
    try {
      const data = await listClasses(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async listMine(token: string) {
    try {
      const data = await listMyClasses(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async get(classId: number, token: string) {
    try {
      const data = await getClass(classId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async listMembers(classId: number, token: string) {
    try {
      const data = await listMembers(classId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async create(body: { name: string; description?: string | null }, token: string) {
    try {
      const data = await createClass(body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async join(inviteCode: string, token: string) {
    try {
      const data = await joinClass(inviteCode, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async removeMember(classId: number, userId: number, token: string) {
    try {
      const data = await removeMember(classId, userId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async updateOwner(classId: number, teacherId: number, token: string) {
    try {
      const data = await updateClassTeacher(classId, teacherId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },
};

