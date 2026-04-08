import * as assignmentsApi from "@/api/assignments";

export const createAssignment = assignmentsApi.createAssignment;
export const listAssignments = assignmentsApi.listAssignments;
export const listMyAssignments = assignmentsApi.listMyAssignments;
export const startAssignment = assignmentsApi.startAssignment;
export const deleteAssignment = assignmentsApi.deleteAssignment;
export const restoreAssignment = assignmentsApi.restoreAssignment;
export const submitSubmission = assignmentsApi.submitSubmission;
export const saveSubmissionAnswers = assignmentsApi.saveSubmissionAnswers;
export const getSubmissionResult = assignmentsApi.getSubmissionResult;
export const listMySubmissions = assignmentsApi.listMySubmissions;
export const getMySubmissionForAssignment = assignmentsApi.getMySubmissionForAssignment;
export const getAssignmentReport = assignmentsApi.getAssignmentReport;
export const postAssignmentReportAiInsight = assignmentsApi.postAssignmentReportAiInsight;
export const getAdminOverviewReport = assignmentsApi.getAdminOverviewReport;

export type {
  AssignmentResponse,
  AssignmentDetail,
  AssignmentCreatePayload,
  ExamRoomOption,
  ExamRoomQuestion,
  SubmissionStartResponse,
  SubmitAnswerPayload,
  SubmitPayload,
  OptionResultItem,
  QuestionResultDetail,
  SubmissionResultResponse,
  MySubmissionSummary,
  MyAssignmentSubmissionResponse,
  ScoreBucket,
  AssignmentReportResponse,
  AssignmentInsightResponse,
  AdminOverviewReportResponse,
} from "@/api/assignments";
