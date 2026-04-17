import { get, patch } from "@/api/client";

export type AccountRequestRowStatus = "pending" | "approved" | "rejected";

export interface AccountRequestRow {
  id: number;
  full_name: string;
  email: string;
  organization: string | null;
  role: "student" | "teacher";
  status: AccountRequestRowStatus;
  created_at: string;
}

export interface AccountRequestListResponse {
  items: AccountRequestRow[];
  total: number;
}

export interface GetAdminAccountRequestsParams {
  status?: AccountRequestRowStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export function getAdminAccountRequests(
  token: string,
  params: GetAdminAccountRequestsParams,
): Promise<AccountRequestListResponse> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.search?.trim()) sp.set("search", params.search.trim());
  if (params.page != null) sp.set("page", String(params.page));
  if (params.page_size != null) sp.set("page_size", String(params.page_size));
  const q = sp.toString();
  return get<AccountRequestListResponse>(`/api/v1/admin/account-requests${q ? `?${q}` : ""}`, token);
}

export function updateAccountRequestStatus(
  token: string,
  id: number,
  status: "approved" | "rejected",
): Promise<AccountRequestRow> {
  return patch<AccountRequestRow>(`/api/v1/admin/account-requests/${id}`, { status }, token);
}
