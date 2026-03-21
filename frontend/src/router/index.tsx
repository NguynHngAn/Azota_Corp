import { Navigate, Route, Routes } from "react-router";
import { lazy, Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AuthProvider, useAuth, ExamProvider } from "../context";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout } from "../components/admin/AdminLayout";
import { TeacherLayout } from "../components/teacher/TeacherLayout";
import { StudentLayout } from "../components/student/StudentLayout";
import { Login } from "../pages/Login";
const LazyLandingPage = lazy(() => import("../pages/LandingPage"));
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
import { AssignmentReportPage } from "../pages/reports";
import { ProfilePage } from "../pages/ProfilePage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminClassesPage } from "../pages/admin/AdminClassesPage";
import { AdminExamsPage } from "../pages/admin/AdminExamsPage";
import { AdminAssignmentsPage } from "../pages/admin/AdminAssignmentsPage";
import { AdminAnalyticsPage } from "../pages/admin/AdminAnalyticsPage";
import { AdminSettingsPage } from "../pages/admin/AdminSettingsPage";
import { TeacherDashboardPage } from "../pages/teacher/TeacherDashboardPage";
import { TeacherQuestionBankPage } from "../pages/teacher/TeacherQuestionBankPage";
import { TeacherStudentsPage } from "../pages/teacher/TeacherStudentsPage";
import { TeacherAntiCheatingPage } from "../pages/teacher/TeacherAntiCheatingPage";
import { TeacherSettingsPage } from "../pages/teacher/TeacherSettingsPage";
import { StudentDashboardPage } from "../pages/student/StudentDashboardPage";
import { StudentResultsPage } from "../pages/student/StudentResultsPage";
import { StudentSettingsPage } from "../pages/student/StudentSettingsPage";
import { ROLES } from "../utils/constants";
import { PreferencesBootstrap } from "../components/settings/PreferencesBootstrap";

function FullPageLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_45%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card/95 p-7 shadow-xl backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>

        <p className="text-base font-semibold tracking-tight">Preparing your workspace</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>

        <div className="mt-6 space-y-3">
          <div className="h-2.5 w-5/6 rounded-full bg-secondary/80" />
          <div className="h-2.5 w-3/5 rounded-full bg-secondary/70" />
          <div className="h-2.5 w-4/6 rounded-full bg-secondary/60" />
        </div>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-2/5 animate-pulse rounded-full bg-primary/80" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 text-xs text-muted-foreground/80">
        Azota is loading resources...
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return <FullPageLoading label="Loading session..." />;
  if (!token || !user)
    return (
      <Suspense fallback={<FullPageLoading label="Loading landing page..." />}>
        <LazyLandingPage />
      </Suspense>
    );
  if (user.role === "admin") return <Navigate to="/admin/classes" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

function LoginRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return <FullPageLoading label="Loading session..." />;
  if (!token || !user) return <Login />;
  if (user.role === "admin") return <Navigate to="/admin/classes" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export function AppRouter() {
  return (
    <AuthProvider>
      <ExamProvider>
        <PreferencesBootstrap />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/signup" element={<LoginRedirect />} />
          <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES[0]]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="exams" element={<AdminExamsPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="classes/new" element={<CreateClassPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="assignments" element={<AdminAssignmentsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="reports" element={<Navigate to="/admin/analytics" replace />} />
        </Route>

          <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={[ROLES[1]]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="classes" element={<ClassListPage />} />
          <Route path="classes/new" element={<CreateClassPage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="exams" element={<ExamListPage />} />
          <Route path="exams/new" element={<CreateExamPage />} />
          <Route path="exams/:id" element={<EditExamPage />} />
          <Route path="question-bank" element={<TeacherQuestionBankPage />} />
          <Route path="assignments" element={<AssignmentListPage />} />
          <Route path="assignments/new" element={<CreateAssignmentPage />} />
          <Route path="assignments/result/:submissionId" element={<SubmissionResultPage />} />
          <Route path="assignments/:id/report" element={<AssignmentReportPage />} />
          <Route path="students" element={<TeacherStudentsPage />} />
          <Route path="anti-cheating" element={<TeacherAntiCheatingPage />} />
          <Route path="settings" element={<TeacherSettingsPage />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[ROLES[2]]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="classes" element={<MyClassesPage />} />
          <Route path="classes/:id" element={<StudentClassDetailPage />} />
          <Route path="assignments" element={<MyAssignmentsPage />} />
          <Route path="assignments/:assignmentId/exam" element={<ExamRoomPage />} />
          <Route path="assignments/result/:submissionId" element={<SubmissionResultPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="settings" element={<StudentSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="join" element={<JoinClassPage />} />
        </Route>
        </Routes>
      </ExamProvider>
    </AuthProvider>
  );
}
