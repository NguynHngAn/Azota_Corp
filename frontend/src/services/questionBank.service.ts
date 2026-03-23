import * as questionBankApi from "@/api/questionBank";

export const listBankQuestions = questionBankApi.listBankQuestions;
export const createBankQuestion = questionBankApi.createBankQuestion;
export const getBankQuestion = questionBankApi.getBankQuestion;
export const updateBankQuestion = questionBankApi.updateBankQuestion;
export const deleteBankQuestion = questionBankApi.deleteBankQuestion;
export const addFromBankToExam = questionBankApi.addFromBankToExam;

export type {
  QuestionType,
  QuestionDifficulty,
  BankAnswerOptionCreate,
  BankQuestionCreate,
  BankQuestionUpdate,
  BankQuestionListItem,
  BankQuestionListResponse,
  BankAnswerOptionResponse,
  BankQuestionResponse,
} from "@/api/questionBank";
