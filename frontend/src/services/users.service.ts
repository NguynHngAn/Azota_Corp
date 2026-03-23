import * as usersApi from "@/api/users";

export const listUsers = usersApi.listUsers;
export const createUser = usersApi.createUser;
export const updateUser = usersApi.updateUser;
export const deactivateUser = usersApi.deactivateUser;
export const resetUserPassword = usersApi.resetUserPassword;
export const uploadMyAvatar = usersApi.uploadMyAvatar;

export type { Role, UserResponse, UserCreatePayload, UserUpdatePayload } from "@/api/users";
