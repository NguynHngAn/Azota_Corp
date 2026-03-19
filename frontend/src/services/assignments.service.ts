import type {
  AdminOverviewReportResponse,
  AssignmentCreatePayload,
  AssignmentDetail,
  AssignmentReportResponse,
  AssignmentResponse,
  SubmissionResultResponse,
  SubmissionResponse,
  SubmissionStartResponse,
  SubmitAnswerPayload,
} from "./types";
import {
  createAssignment,
  getAdminOverviewReport,
  getAssignmentReport,
  getSubmissionResult,
  listAssignments,
  listMyAssignments,
  startAssignment,
  submitSubmission,
} from "@/api/assignments";

export const assignmentsService = {
  async create(body: AssignmentCreatePayload, token: string) {
    try {
      const data = await createAssignment(body, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async list(token: string) {
    try {
      const data = await listAssignments(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async listMine(token: string) {
    try {
      const data = await listMyAssignments(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async start(assignmentId: number, token: string) {
    try {
      const data = await startAssignment(assignmentId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async submit(submissionId: number, answers: SubmitAnswerPayload[], token: string) {
    try {
      const data = await submitSubmission(submissionId, { answers }, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async submissionResult(submissionId: number, token: string) {
    try {
      const data = await getSubmissionResult(submissionId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async report(assignmentId: number, token: string) {
    try {
      const data = await getAssignmentReport(assignmentId, token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },

  async adminOverview(token: string) {
    try {
      const data = await getAdminOverviewReport(token);
      return { success: true as const, message: "OK", data };
    } catch (e) {
      return { success: false as const, message: e instanceof Error ? e.message : "Failed", data: null };
    }
  },
};

