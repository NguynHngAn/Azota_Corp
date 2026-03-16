import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth, ExamProvider } from "../context";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/DashboardLayout";
import { Login } from "../pages/Login";
import {
  ClassListPage,
  CreateClassPage,
  ClassDetailPage,
  MyClassesPage,
  JoinClassPage,
  StudentClassDetailPage,
} from "../pages/classes";
import { ExamListPage, CreateExamPage, EditExamPage } from "../pages/exams";
import {
  AssignmentListPage,
  CreateAssignmentPage,
  MyAssignmentsPage,
  ExamRoomPage,
  SubmissionResultPage,
} from "../pages/assignments";
import { AssignmentReportPage, AdminOverviewReportPage } from "../pages/reports";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { ROLES } from "../utils/constants";

function RootRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/classes" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/classes" replace />;
  return <Navigate to="/student/classes" replace />;
}

function LoginRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token || !user) return <Login />;
  if (user.role === "admin") return <Navigate to="/admin/classes" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/classes" replace />;
  return <Navigate to="/student/classes" replace />;
}

export function AppRouter() {
  return (
    <AuthProvider>
      <ExamProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginRedirect />} />

          <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES[0]]}>
              <DashboardLayout
                title="Admin Dashboard"
                navLinks={[
                  { to: "/admin/classes", label: "Classes" },
                  { to: "/admin/users", label: "Users" },
                  { to: "/admin/reports", label: "Reports" },
                ]}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/classes" replace />} />
          <Route path="classes" element={<ClassListPage />} />
          <Route path="classes/new" element={<CreateClassPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminOverviewReportPage />} />
        </Route>

          <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={[ROLES[1]]}>
              <DashboardLayout
                title="Teacher Dashboard"
                navLinks={[
                  { to: "/teacher/classes", label: "Classes" },
                  { to: "/teacher/exams", label: "Exams" },
                  { to: "/teacher/assignments", label: "Assignments" },
                ]}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/teacher/classes" replace />} />
          <Route path="classes" element={<ClassListPage />} />
          <Route path="classes/new" element={<CreateClassPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="exams" element={<ExamListPage />} />
          <Route path="exams/new" element={<CreateExamPage />} />
          <Route path="exams/:id" element={<EditExamPage />} />
          <Route path="assignments" element={<AssignmentListPage />} />
          <Route path="assignments/new" element={<CreateAssignmentPage />} />
          <Route path="assignments/result/:submissionId" element={<SubmissionResultPage />} />
          <Route path="assignments/:id/report" element={<AssignmentReportPage />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[ROLES[2]]}>
              <DashboardLayout
                title="Student Dashboard"
                navLinks={[
                  { to: "/student/classes", label: "My classes" },
                  { to: "/student/assignments", label: "Assignments" },
                  { to: "/student/join", label: "Join class" },
                ]}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/classes" replace />} />
          <Route path="classes" element={<MyClassesPage />} />
          <Route path="classes/:id" element={<StudentClassDetailPage />} />
          <Route path="assignments" element={<MyAssignmentsPage />} />
          <Route path="assignments/:assignmentId/exam" element={<ExamRoomPage />} />
          <Route path="assignments/result/:submissionId" element={<SubmissionResultPage />} />
          <Route path="join" element={<JoinClassPage />} />
        </Route>
        </Routes>
      </ExamProvider>
    </AuthProvider>
  );
}
