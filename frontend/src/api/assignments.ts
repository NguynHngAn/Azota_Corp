import { get, post } from "@/api/client";

export interface AssignmentResponse {
  id: number;
  exam_id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  max_violations: number;
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
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  max_violations?: number;
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
  max_violations: number;
  violation_count: number;
  questions: ExamRoomQuestion[];
}

export interface SubmitAnswerPayload {
  question_id: number;
  chosen_option_ids: number[];
}

export interface SubmitPayload {
  answers: SubmitAnswerPayload[];
  submit_reason?: string | null;
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
  body: SubmitPayload,
  token: string
): Promise<{ id: number; assignment_id: number; user_id: number; started_at: string; submitted_at: string | null; score: number | null; auto_submitted: boolean; submit_reason: string | null; violation_count: number }> {
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
  order_index: number;
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

export interface MySubmissionSummary {
  submission_id: number;
  assignment_id: number;
  exam_title: string;
  class_name: string;
  submitted_at: string;
  score: number | null;
}

export interface MyAssignmentSubmissionResponse {
  submission_id: number;
  assignment_id: number;
  exam_title: string;
  submitted_at: string;
  score: number | null;
}

export function listMySubmissions(token: string): Promise<MySubmissionSummary[]> {
  return get<MySubmissionSummary[]>("/api/v1/assignments/submissions/my", token);
}

export function getMySubmissionForAssignment(assignmentId: number, token: string): Promise<MyAssignmentSubmissionResponse> {
  return get<MyAssignmentSubmissionResponse>(`/api/v1/assignments/${assignmentId}/my-submission`, token);
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
  top_missed_questions: {
    question_id: number;
    question_text: string;
    incorrect_count: number;
    correct_count: number;
    total_answers: number;
    incorrect_rate: number;
  }[];
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

export interface AssignmentInsightResponse {
  model: string;
  provider: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  suggestions: string[];
}

export function postAssignmentReportAiInsight(
  assignmentId: number,
  token: string,
): Promise<AssignmentInsightResponse> {
  return post<AssignmentInsightResponse>(`/api/v1/assignments/${assignmentId}/report/ai-insight`, {}, token);
}

export function getAdminOverviewReport(token: string): Promise<AdminOverviewReportResponse> {
  return get<AdminOverviewReportResponse>("/api/v1/assignments/reports/overview", token);
}
