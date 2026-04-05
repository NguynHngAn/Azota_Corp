import type { ExamFormState } from "@/pages/exams/types";

export const NEW_EXAM_DRAFT_KEY = "new_exam_draft";

export function examDraftStorageKey(examId: number): string {
  return `exam_draft_${examId}`;
}

export interface ExamDraftBackupV1 {
  version: 1;
  updatedAt: number;
  state: ExamFormState;
}

function isExamFormState(value: unknown): value is ExamFormState {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.description === "string" &&
    typeof o.is_draft === "boolean" &&
    typeof o.shuffle_questions === "boolean" &&
    typeof o.shuffle_options === "boolean" &&
    Array.isArray(o.questions)
  );
}

export function parseExamDraftBackup(raw: string | null): ExamDraftBackupV1 | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (o.version !== 1 || typeof o.updatedAt !== "number") return null;
    if (!isExamFormState(o.state)) return null;
    return { version: 1, updatedAt: o.updatedAt, state: o.state };
  } catch {
    return null;
  }
}

export function readExamDraftBackup(key: string): ExamDraftBackupV1 | null {
  if (typeof window === "undefined") return null;
  return parseExamDraftBackup(localStorage.getItem(key));
}

export function writeExamDraftBackup(key: string, backup: ExamDraftBackupV1): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(backup));
  } catch {
    // Quota, private mode, or disabled storage — ignore
  }
}

export function clearExamDraftBackup(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
