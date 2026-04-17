import { post } from "@/api/client";

export type AccountRequestRole = "student" | "teacher";

export interface AccountRequestPayload {
  full_name: string;
  email: string;
  organization?: string;
  role: AccountRequestRole;
  message?: string;
}

export interface AccountRequestResponse {
  id: number;
}

export function submitAccountRequest(body: AccountRequestPayload): Promise<AccountRequestResponse> {
  return post<AccountRequestResponse>("/api/v1/account-requests", body);
}
