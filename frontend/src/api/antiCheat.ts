import { get, post } from "@/api/client";

export type AntiCheatEventType =
  | "EXAM_START"
  | "EXAM_SUBMIT"
  | "FULLSCREEN_EXIT"
  | "TAB_HIDDEN"
  | "WINDOW_BLUR"
  | "COPY_ATTEMPT"
  | "CUT_ATTEMPT"
  | "PASTE_ATTEMPT"
  | "CONTEXT_MENU"
  | "TEXT_SELECTION"
  | "DEVTOOLS_DETECTED";

export interface AntiCheatEventCreate {
  assignment_id: number;
  submission_id?: number | null;
  event_type: AntiCheatEventType | string;
  meta?: Record<string, unknown>;
}

export interface AntiCheatMonitorSummary {
  total_students: number;
  active_now: number;
  submitted: number;
  suspicious: number;
}

export interface AntiCheatMonitorRow {
  user_id: number;
  full_name: string;
  email: string;
  class_id: number;
  class_name: string;
  assignment_id: number;
  exam_title: string;
  submission_id: number | null;
  started_at: string | null;
  submitted_at: string | null;
  events_total: number;
  last_event_type: string | null;
  last_event_at: string | null;
  suspicious: boolean;
}

export interface AntiCheatMonitorResponse {
  summary: AntiCheatMonitorSummary;
  rows: AntiCheatMonitorRow[];
}

export async function logAntiCheatEvent(body: AntiCheatEventCreate, token: string): Promise<void> {
  await post("/api/v1/anti-cheat/events", body, token);
}

export async function getTeacherAntiCheatMonitor(
  token: string,
  opts?: { suspicious_only?: boolean; lookback_minutes?: number; assignment_id?: number },
): Promise<AntiCheatMonitorResponse> {
  const params = new URLSearchParams();
  if (opts?.suspicious_only) params.set("suspicious_only", "true");
  if (typeof opts?.lookback_minutes === "number") params.set("lookback_minutes", String(opts.lookback_minutes));
  if (typeof opts?.assignment_id === "number") params.set("assignment_id", String(opts.assignment_id));
  const qs = params.toString();
  return get<AntiCheatMonitorResponse>(`/api/v1/anti-cheat/monitor${qs ? `?${qs}` : ""}`, token);
}

