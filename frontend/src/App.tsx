import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LandingPage from "./pages/common/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import RoleDashboard from "./pages/dashboard/RoleDashboardPage";
import ExamListPage from "./pages/exams/ExamListPage";
import CreateExamPage from "./pages/exams/CreateExamPage";
import QuestionBankPage from "./pages/exams/QuestionBankPage";
import ClassListPage from "./pages/classes/ClassListPage";
import StudentsPage from "./pages/students/StudentsPage";
import AnalyticsPage from "./pages/reports/AnalyticsPage";
import AntiCheatingPage from "./pages/system/AntiCheatingPage";
import SettingsPage from "./pages/system/SettingsPage";
import AssignmentListPage from "./pages/assignments/AssignmentListPage";
import TakeExamPage from "./pages/learning/TakeExamPage";
import MyClassesPage from "./pages/learning/MyClassesPage";
import MyResultsPage from "./pages/learning/MyResultsPage";
import AdminDashboard from "./pages/dashboard/AdminDashboardPage";
import ExamDetailPage from "./pages/exams/ExamDetailPage";
import AssignmentSubmissionsReviewPage from "./pages/assignments/AssignmentSubmissionsReviewPage";
import NotFound from "./pages/common/NotFoundPage";

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <ExamListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/create"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <CreateExamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <QuestionBankPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classes"
                element={
                  <ProtectedRoute>
                    <ClassListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <AssignmentListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments/:assignmentId/submissions"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <AssignmentSubmissionsReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/:examId/detail"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <ExamDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/anti-cheating"
                element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <AntiCheatingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Student routes */}
              <Route
                path="/my-classes"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MyClassesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MyResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam/:examId"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TakeExamPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
