import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RoleDashboard from "./pages/RoleDashboard";
import ExamsPage from "./pages/ExamsPage";
import CreateExamPage from "./pages/CreateExamPage";
import QuestionBankPage from "./pages/QuestionBankPage";
import ClassesPage from "./pages/ClassesPage";
import StudentsPage from "./pages/StudentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AntiCheatingPage from "./pages/AntiCheatingPage";
import SettingsPage from "./pages/SettingsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import TakeExamPage from "./pages/student/TakeExamPage";
import MyClassesPage from "./pages/student/MyClassesPage";
import MyResultsPage from "./pages/student/MyResultsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ExamDetailPage from "./pages/ExamDetailPage";
import SubmissionsReviewPage from "./pages/SubmissionsReviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                      <ExamsPage />
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
                      <ClassesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assignments"
                  element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                      <AssignmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assignments/:assignmentId/submissions"
                  element={
                    <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                      <SubmissionsReviewPage />
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
  </QueryClientProvider>
);

export default App;
