import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useExam } from "@/context";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { ProtectedRouter } from "@/router/ProtectedRoute";
import { TopNavBar } from "@/components/layouts/TopNavBar";
import {
  getBaseNavItems,
  getEffectiveNavItems,
  type DashboardRole,
} from "@/components/layouts/NavLinks";
import { t, useLanguage } from "@/i18n";

export type { DashboardRole };

export function DashboardLayout({ role }: { role: DashboardRole }) {
  const { user } = useAuth();
  const exam = useExam();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = useLanguage();

  const baseNav = useMemo(() => getBaseNavItems(role, lang), [lang, role]);

  const effectiveNav = useMemo(
    () =>
      getEffectiveNavItems(baseNav, {
        role,
        userRole: user?.role,
        inProgress: exam.inProgress,
        assignmentId: exam.assignmentId,
      }),
    [baseNav, exam.assignmentId, exam.inProgress, role, user?.role]
  );

  useEffect(() => {
    if (role !== "student" || user?.role !== "student") return;
    if (exam.inProgress && exam.assignmentId) {
      const examPath = `/student/assignments/${exam.assignmentId}/exam`;
      if (!location.pathname.startsWith(examPath)) {
        navigate(examPath, { replace: true });
      }
    }
  }, [exam.assignmentId, exam.inProgress, location.pathname, navigate, role, user?.role]);

  const searchPlaceholder =
    role === "admin"
      ? t("common.searchPlaceholderAdmin", lang)
      : role === "teacher"
        ? t("common.searchPlaceholderTeacher", lang)
        : t("common.searchPlaceholderStudent", lang);

  return (
    <ProtectedRouter allowedRoles={[role]}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <AppSidebar role={role} items={effectiveNav} pathname={location.pathname} />
          <div className="flex-1 min-w-0">
            <TopNavBar role={role} searchPlaceholder={searchPlaceholder} />
            <main className="max-w-6xl mx-auto px-6 py-6">
              <div className="admin-page-enter">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRouter>
  );
}
