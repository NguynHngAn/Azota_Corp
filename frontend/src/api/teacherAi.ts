import { post } from "@/api/client";
import type { BankQuestionCreate, QuestionDifficulty, QuestionType } from "@/api/questionBank";

export type TeacherAITask = "generate_questions" | "suggest_similar_questions";

export interface TeacherAIQuestionRequest {
  task: TeacherAITask;
  prompt: string;
  count: number;
  question_type?: QuestionType | null;
  difficulty: QuestionDifficulty;
  language: string;
  source_question_text?: string | null;
  tags: string[];
}

export interface TeacherAIQuestionResponse {
  task: TeacherAITask;
  model: string;
  provider: string;
  note?: string | null;
  items: BankQuestionCreate[];
}

export async function generateTeacherAIQuestions(
  body: TeacherAIQuestionRequest,
  token: string,
): Promise<TeacherAIQuestionResponse> {
  return post<TeacherAIQuestionResponse>("/api/v1/teacher-ai/questions", body, token);
}
