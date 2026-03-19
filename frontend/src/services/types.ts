export type Role = "admin" | "teacher" | "student";

// Auth
export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

// Users
export type UserResponse = {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type UserCreatePayload = {
  email: string;
  full_name: string;
  password: string;
  role: "teacher" | "student";
  is_active?: boolean;
};

export type UserUpdatePayload = {
  full_name?: string;
  role?: "teacher" | "student";
  is_active?: boolean;
};

// Classes
export type ClassResponse = {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  invite_code: string;
  created_at: string;
};

export type ClassDetail = ClassResponse & {
  creator?: Pick<UserResponse, "id" | "email" | "full_name" | "role"> | null;
  member_count: number;
};

export type ClassMemberResponse = {
  id: number;
  class_id: number;
  user_id: number;
  joined_at: string;
  user?: Pick<UserResponse, "id" | "email" | "full_name" | "role"> | null;
};

// Exams
export type QuestionType = "single_choice" | "multiple_choice";

export type AnswerOptionPayload = {
  order_index: number;
  text: string;
  is_correct: boolean;
};

export type QuestionPayload = {
  order_index: number;
  question_type: QuestionType;
  text: string;
  options: AnswerOptionPayload[];
};

export type ExamResponse = {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
};

export type AnswerOptionResponse = AnswerOptionPayload & { id: number };

export type QuestionResponse = {
  id: number;
  exam_id: number;
  order_index: number;
  question_type: QuestionType;
  text: string;
  options: AnswerOptionResponse[];
};

export type ExamDetail = ExamResponse & { questions: QuestionResponse[] };

// Assignments
export type AssignmentResponse = {
  id: number;
  exam_id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  created_at: string;
};

export type AssignmentDetail = AssignmentResponse & {
  exam_title: string;
  class_name: string;
};

export type AssignmentCreatePayload = {
  exam_id: number;
  class_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type ExamRoomOption = {
  id: number;
  order_index: number;
  text: string;
};

export type ExamRoomQuestion = {
  id: number;
  order_index: number;
  question_type: QuestionType;
  text: string;
  options: ExamRoomOption[];
};

export type SubmissionStartResponse = {
  submission_id: number;
  assignment_id: number;
  started_at: string;
  duration_minutes: number;
  exam_title: string;
  questions: ExamRoomQuestion[];
};

export type SubmitAnswerPayload = {
  question_id: number;
  chosen_option_ids: number[];
};

export type SubmissionResponse = {
  id: number;
  assignment_id: number;
  user_id: number;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
};

export type OptionResultItem = {
  id: number;
  text: string;
  is_correct: boolean;
};

export type QuestionResultDetail = {
  question_id: number;
  question_text: string;
  correct: boolean;
  chosen_option_ids: number[];
  options: OptionResultItem[];
  ai_explanation?: string | null;
};

export type SubmissionResultResponse = {
  id: number;
  assignment_id: number;
  user_id: number;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  exam_title: string;
  question_results: { question_id: number; correct: boolean }[];
  question_details: QuestionResultDetail[];
};

export type ScoreBucket = {
  label: string;
  min_score: number;
  max_score: number;
  count: number;
};

export type AssignmentReportResponse = {
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
};

export type AdminOverviewReportResponse = {
  total_assignments: number;
  total_assigned_students: number;
  total_submissions: number;
  total_submitted: number;
  average_score: number | null;
  score_buckets: ScoreBucket[];
};

