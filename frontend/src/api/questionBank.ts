import { del, get, post, put } from "@/api/client";

export type QuestionType = "single_choice" | "multiple_choice";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface BankAnswerOptionCreate {
  order_index: number;
  text: string;
  is_correct: boolean;
}

export interface BankQuestionCreate {
  question_type: QuestionType;
  text: string;
  explanation?: string | null;
  difficulty: QuestionDifficulty;
  is_active: boolean;
  options: BankAnswerOptionCreate[];
  tags: string[];
}

export interface BankQuestionUpdate {
  question_type?: QuestionType | null;
  text?: string | null;
  explanation?: string | null;
  difficulty?: QuestionDifficulty | null;
  is_active?: boolean | null;
  options?: BankAnswerOptionCreate[] | null;
  tags?: string[] | null;
}

export interface BankQuestionListItem {
  id: number;
  question_type: QuestionType;
  text: string;
  difficulty: QuestionDifficulty;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface BankQuestionListResponse {
  total: number;
  items: BankQuestionListItem[];
}

export interface BankAnswerOptionResponse extends BankAnswerOptionCreate {
  id: number;
}

export interface BankQuestionResponse {
  id: number;
  owner_id: number;
  question_type: QuestionType;
  text: string;
  explanation: string | null;
  difficulty: QuestionDifficulty;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  options: BankAnswerOptionResponse[];
  tags: string[];
}

export async function listBankQuestions(
  token: string,
  opts?: { q?: string; tag?: string; is_active?: boolean; limit?: number; offset?: number },
): Promise<BankQuestionListResponse> {
  const params = new URLSearchParams();
  if (opts?.q) params.set("q", opts.q);
  if (opts?.tag) params.set("tag", opts.tag);
  if (typeof opts?.is_active === "boolean") params.set("is_active", String(opts.is_active));
  if (typeof opts?.limit === "number") params.set("limit", String(opts.limit));
  if (typeof opts?.offset === "number") params.set("offset", String(opts.offset));
  const qs = params.toString();
  return get<BankQuestionListResponse>(`/api/v1/question-bank${qs ? `?${qs}` : ""}`, token);
}

export async function createBankQuestion(body: BankQuestionCreate, token: string): Promise<BankQuestionResponse> {
  return post<BankQuestionResponse>("/api/v1/question-bank", body, token);
}

export async function getBankQuestion(id: number, token: string): Promise<BankQuestionResponse> {
  return get<BankQuestionResponse>(`/api/v1/question-bank/${id}`, token);
}

export async function updateBankQuestion(id: number, body: BankQuestionUpdate, token: string): Promise<BankQuestionResponse> {
  return put<BankQuestionResponse>(`/api/v1/question-bank/${id}`, body, token);
}

export async function deleteBankQuestion(id: number, token: string): Promise<void> {
  await del(`/api/v1/question-bank/${id}`, token);
}

export async function addFromBankToExam(examId: number, bankQuestionIds: number[], token: string): Promise<{ added: number; question_ids: number[] }> {
  return post<{ added: number; question_ids: number[] }>(`/api/v1/question-bank/exams/${examId}/add`, { bank_question_ids: bankQuestionIds }, token);
}

