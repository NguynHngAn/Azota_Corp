import { get } from "@/api/client";

export interface AntiCheatAnalyticsOverview {
  assignment_scope: string;
  submissions_tracked: number;
  suspicious_count: number;
  max_weighted_score: number;
  total_weighted_score_mass: number;
}

export interface ScoreDistributionBucket {
  label: string;
  min_score: number;
  max_score: number | null;
  count: number;
}

export interface EventBreakdownRow {
  event_type: string;
  count: number;
  weighted_contribution: number;
}

export interface LeaderboardEntry {
  rank: number;
  submission_id: number;
  assignment_id: number;
  user_id: number;
  full_name: string;
  email: string;
  exam_title: string;
  weighted_score: number;
  suspicious: boolean;
  submitted_at: string | null;
}

export interface AntiCheatAnalyticsDashboardResponse {
  overview: AntiCheatAnalyticsOverview;
  suspicious_threshold: number;
  distribution: ScoreDistributionBucket[];
  event_breakdown: EventBreakdownRow[];
  leaderboard: LeaderboardEntry[];
}

export interface TimelineEventItem {
  id: number;
  event_type: string;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface SubmissionTimelineResponse {
  submission_id: number;
  assignment_id: number;
  events: TimelineEventItem[];
}

export async function getAntiCheatAnalyticsDashboard(
  token: string,
  opts?: { assignment_id?: number; leaderboard_limit?: number },
): Promise<AntiCheatAnalyticsDashboardResponse> {
  const params = new URLSearchParams();
  if (typeof opts?.assignment_id === "number") params.set("assignment_id", String(opts.assignment_id));
  if (typeof opts?.leaderboard_limit === "number") params.set("leaderboard_limit", String(opts.leaderboard_limit));
  const qs = params.toString();
  return get<AntiCheatAnalyticsDashboardResponse>(`/api/v1/anti-cheat/analytics/dashboard${qs ? `?${qs}` : ""}`, token);
}

export async function getAntiCheatSubmissionTimeline(
  token: string,
  submissionId: number,
  opts?: { assignment_id?: number },
): Promise<SubmissionTimelineResponse> {
  const params = new URLSearchParams();
  if (typeof opts?.assignment_id === "number") params.set("assignment_id", String(opts.assignment_id));
  const qs = params.toString();
  return get<SubmissionTimelineResponse>(
    `/api/v1/anti-cheat/analytics/submissions/${submissionId}/timeline${qs ? `?${qs}` : ""}`,
    token,
  );
}
