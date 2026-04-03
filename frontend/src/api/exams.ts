import { get, post, put, del } from "@/api/client";

export type QuestionType = "single_choice" | "multiple_choice";

export interface AnswerOptionPayload {
  order_index: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionPayload {
  order_index: number;
  question_type: QuestionType;
  text: string;
  options: AnswerOptionPayload[];
}

export interface ExamResponse {
  id: number;
  title: string;
  description: string | null;
  created_by: number;
  is_draft: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnswerOptionResponse {
  id: number;
  order_index: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionResponse {
  id: number;
  exam_id: number;
  order_index: number;
  question_type: QuestionType;
  text: string;
  options: AnswerOptionResponse[];
}

export interface ExamDetail extends ExamResponse {
  questions: QuestionResponse[];
}

export function listExams(token: string): Promise<ExamResponse[]> {
  return get<ExamResponse[]>("/api/v1/exams", token);
}

export function getExam(examId: number, token: string): Promise<ExamDetail> {
  return get<ExamDetail>(`/api/v1/exams/${examId}`, token);
}

export function createExam(
  body: { title: string; description?: string | null; is_draft?: boolean; shuffle_questions?: boolean; shuffle_options?: boolean; questions?: QuestionPayload[] },
  token: string
): Promise<ExamDetail> {
  return post<ExamDetail>("/api/v1/exams", body, token);
}

export function updateExam(
  examId: number,
  body: { title?: string; description?: string | null; is_draft?: boolean; shuffle_questions?: boolean; shuffle_options?: boolean },
  token: string
): Promise<ExamResponse> {
  return put<ExamResponse>(`/api/v1/exams/${examId}`, body, token);
}

export function deleteExam(examId: number, token: string): Promise<void> {
  return del(`/api/v1/exams/${examId}`, token);
}

export function addQuestion(examId: number, body: QuestionPayload, token: string): Promise<QuestionResponse> {
  return post<QuestionResponse>(`/api/v1/exams/${examId}/questions`, body, token);
}

export function updateQuestion(
  examId: number,
  questionId: number,
  body: { order_index?: number; question_type?: QuestionType; text?: string; options?: AnswerOptionPayload[] },
  token: string
): Promise<QuestionResponse> {
  return put<QuestionResponse>(`/api/v1/exams/${examId}/questions/${questionId}`, body, token);
}

export function deleteQuestion(examId: number, questionId: number, token: string): Promise<void> {
  return del(`/api/v1/exams/${examId}/questions/${questionId}`, token);
}
