import * as examsApi from "@/api/exams";

export const listExams = examsApi.listExams;
export const getExam = examsApi.getExam;
export const createExam = examsApi.createExam;
export const updateExam = examsApi.updateExam;
export const deleteExam = examsApi.deleteExam;
export const restoreExam = examsApi.restoreExam;
export const addQuestion = examsApi.addQuestion;
export const updateQuestion = examsApi.updateQuestion;
export const deleteQuestion = examsApi.deleteQuestion;

export type {
  QuestionType,
  AnswerOptionPayload,
  QuestionPayload,
  ExamResponse,
  AnswerOptionResponse,
  QuestionResponse,
  ExamDetail,
} from "@/api/exams";
