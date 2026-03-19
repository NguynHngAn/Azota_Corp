import { get, post, del, put } from "./client";

export interface ClassResponse {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  invite_code: string;
  created_at: string;
}

export interface ClassDetail extends ClassResponse {
  creator?: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  } | null;
  member_count: number;
}

export interface ClassMemberResponse {
  id: number;
  class_id: number;
  user_id: number;
  joined_at: string;
  user?: { id: number; email: string; full_name: string; role: string } | null;
}

export function listClasses(token: string): Promise<ClassResponse[]> {
  return get<ClassResponse[]>("/classes", token);
}

export function listMyClasses(token: string): Promise<ClassResponse[]> {
  return get<ClassResponse[]>("/classes/my", token);
}

export function getClass(classId: number, token: string): Promise<ClassDetail> {
  return get<ClassDetail>(`/classes/${classId}`, token);
}

export function listMembers(
  classId: number,
  token: string,
): Promise<ClassMemberResponse[]> {
  return get<ClassMemberResponse[]>(
    `/classes/${classId}/members`,
    token,
  );
}

export function createClass(
  body: { name: string; description?: string | null },
  token: string,
): Promise<ClassResponse> {
  return post<ClassResponse>("/classes", body, token);
}

export function joinClass(
  inviteCode: string,
  token: string,
): Promise<ClassResponse> {
  return post<ClassResponse>(
    "/classes/join",
    { invite_code: inviteCode.trim() },
    token,
  );
}

export function removeMember(
  classId: number,
  userId: number,
  token: string,
): Promise<void> {
  return del(`/classes/${classId}/members/${userId}`, token);
}

export function updateClassTeacher(
  classId: number,
  teacherId: number,
  token: string,
): Promise<ClassResponse> {
  return put<ClassResponse>(
    `/classes/${classId}/owner`,
    { teacher_id: teacherId },
    token,
  );
}
