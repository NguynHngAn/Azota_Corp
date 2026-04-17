import * as authApi from "@/api/auth";

export const login = authApi.login;
export const refreshWithToken = authApi.refreshWithToken;
export const getMe = authApi.getMe;
export const requestPasswordReset = authApi.requestPasswordReset;
export const resetPassword = authApi.resetPassword;

export type { LoginResponse, UserResponse, PasswordResetRequestedResponse } from "@/api/auth";
