import { get, post } from "./client";

export interface AssignmentResponse {
  id: number;
  exam_id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  created_at: string;
}

export interface AssignmentDetail extends AssignmentResponse {
  exam_title: string;
  class_name: string;
}

export interface AssignmentCreatePayload {
  exam_id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface ExamRoomOption {
  id: number;
  order_index: number;
  text: string;
}

export interface ExamRoomQuestion {
  id: number;
  order_index: number;
  question_type: "single_choice" | "multiple_choice";
  text: string;
  options: ExamRoomOption[];
}

export interface SubmissionStartResponse {
  submission_id: number;
  assignment_id: number;
  started_at: string;
  duration_minutes: number;
  exam_title: string;
  questions: ExamRoomQuestion[];
}

export interface SubmitAnswerPayload {
  question_id: number;
  chosen_option_ids: number[];
}

export function createAssignment(body: AssignmentCreatePayload, token: string): Promise<AssignmentResponse> {
  return post<AssignmentResponse>("/api/v1/assignments", body, token);
}

export function listAssignments(token: string): Promise<AssignmentDetail[]> {
  return get<AssignmentDetail[]>("/api/v1/assignments", token);
}

export function listMyAssignments(token: string): Promise<AssignmentDetail[]> {
  return get<AssignmentDetail[]>("/api/v1/assignments/my", token);
}

export function startAssignment(assignmentId: number, token: string): Promise<SubmissionStartResponse> {
  return post<SubmissionStartResponse>(`/api/v1/assignments/${assignmentId}/start`, {}, token);
}

export function submitSubmission(
  submissionId: number,
  body: { answers: SubmitAnswerPayload[] },
  token: string
): Promise<{ id: number; assignment_id: number; user_id: number; started_at: string; submitted_at: string | null; score: number | null }> {
  return post(`/api/v1/assignments/submissions/${submissionId}/submit`, body, token);
}

export interface OptionResultItem {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionResultDetail {
  question_id: number;
  question_text: string;
  correct: boolean;
  chosen_option_ids: number[];
  options: OptionResultItem[];
  ai_explanation?: string | null;
}

export interface SubmissionResultResponse {
  id: number;
  assignment_id: number;
  user_id: number;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  exam_title: string;
  question_results: { question_id: number; correct: boolean }[];
  question_details: QuestionResultDetail[];
}

export function getSubmissionResult(submissionId: number, token: string): Promise<SubmissionResultResponse> {
  return get<SubmissionResultResponse>(`/api/v1/assignments/submissions/${submissionId}/result`, token);
}

// Reporting
export interface ScoreBucket {
  label: string;
  min_score: number;
  max_score: number;
  count: number;
}

export interface AssignmentReportResponse {
  assignment_id: number;
  exam_id: number;
  class_id: number;
  exam_title: string;
  class_name: string;
  total_students: number;
  submitted_count: number;
  not_submitted_count: number;
  average_score: number | null;
  min_score: number | null;
  max_score: number | null;
  score_buckets: ScoreBucket[];
}

export interface AdminOverviewReportResponse {
  total_assignments: number;
  total_assigned_students: number;
  total_submissions: number;
  total_submitted: number;
  average_score: number | null;
  score_buckets: ScoreBucket[];
}

export function getAssignmentReport(assignmentId: number, token: string): Promise<AssignmentReportResponse> {
  return get<AssignmentReportResponse>(`/api/v1/assignments/${assignmentId}/report`, token);
}

export function getAdminOverviewReport(token: string): Promise<AdminOverviewReportResponse> {
  return get<AdminOverviewReportResponse>("/api/v1/assignments/reports/overview", token);
}
