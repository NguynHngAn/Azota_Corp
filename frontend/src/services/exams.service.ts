import type { ExamDetail, ExamResponse, QuestionPayload, QuestionResponse, QuestionType } from "./types";
import {
  addQuestion,
  createExam,
  deleteExam,
  deleteQuestion,
  getExam,
  listExams,
  updateExam,
  updateQuestion,
} from "@/api/exams";

export const examsService = {
  async list(token: string) {
    try {
      const data = await listExams(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async get(examId: number, token: string) {
    try {
      const data = await getExam(examId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  create(
    body: {
      title: string;
      description?: string | null;
      is_draft?: boolean;
      questions?: QuestionPayload[];
    },
    token: string,
  ) {
    return createExam(body, token)
      .then((data) => ({ success: true as const, message: "OK", data }))
      .catch((e) => ({ success: false as const, message: e instanceof Error ? e.message : "Failed", data: null }));
  },

  async update(
    examId: number,
    body: { title?: string; description?: string | null; is_draft?: boolean },
    token: string,
  ) {
    try {
      const data = await updateExam(examId, body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async remove(examId: number, token: string) {
    try {
      const data = await deleteExam(examId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async addQuestion(examId: number, body: QuestionPayload, token: string) {
    try {
      const data = await addQuestion(examId, body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async updateQuestion(
    examId: number,
    questionId: number,
    body: { order_index?: number; question_type?: QuestionType; text?: string; options?: QuestionPayload["options"] },
    token: string,
  ) {
    try {
      const data = await updateQuestion(examId, questionId, body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async deleteQuestion(examId: number, questionId: number, token: string) {
    try {
      const data = await deleteQuestion(examId, questionId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },
};

