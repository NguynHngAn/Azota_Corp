export { get, post, put, del } from "./client";
export { login, getMe, type LoginResponse, type UserResponse } from "./auth";
export {
  listClasses,
  listMyClasses,
  getClass,
  listMembers,
  createClass,
  joinClass,
  removeMember,
  type ClassResponse,
  type ClassDetail,
  type ClassMemberResponse,
} from "./classes";
export {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  type ExamResponse,
  type ExamDetail,
  type QuestionResponse,
  type QuestionType,
  type QuestionPayload,
  type AnswerOptionPayload,
} from "./exams";

export {
  startAssignment,
  submitSubmission,
  getSubmissionResult,
  listAssignments,
  listMyAssignments,
  createAssignment,
  getAssignmentReport,
  listMySubmissions,
  getMySubmissionForAssignment,
  type AssignmentDetail,
  type SubmissionStartResponse,
  type SubmissionResultResponse,
  type AssignmentReportResponse,
  type MySubmissionSummary,
  type MyAssignmentSubmissionResponse,
} from "./assignments";

export {
  logAntiCheatEvent,
  getTeacherAntiCheatMonitor,
  type AntiCheatEventType,
  type AntiCheatEventCreate,
  type AntiCheatMonitorResponse,
  type AntiCheatMonitorRow,
  type AntiCheatMonitorSummary,
} from "./antiCheat";
