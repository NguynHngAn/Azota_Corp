import * as authApi from "@/api/auth";

export const login = authApi.login;
export const getMe = authApi.getMe;

export type { LoginResponse, UserResponse } from "@/api/auth";
