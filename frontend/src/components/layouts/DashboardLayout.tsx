import type React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useExam } from "@/context";
import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, useLanguage } from "@/i18n";
import { resolveStaticUrl } from "@/utils/url";

export type DashboardRole = "admin" | "teacher" | "student";

type NavItem = { to: string; label: string; key: string; icon: React.ComponentType<{ className?: string }> };

function initials(text: string, fallback: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return fallback;
  return trimmed[0].toUpperCase();
}

const roleInitial: Record<DashboardRole, string> = {
  admin: "A",
  teacher: "T",
  student: "S",
};

const roleBadgeClass: Record<DashboardRole, string> = {
  admin: "text-muted-foreground",
  teacher: "text-muted-foreground",
  student: "text-primary",
};

const roleBadgeLabel: Record<DashboardRole, string> = {
  admin: "ADMIN",
  teacher: "TEACHER",
  student: "STUDENT",
};

export function DashboardLayout({ role }: { role: DashboardRole }) {
  const { user, logout } = useAuth();
  const exam = useExam();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = useLanguage();

  const baseNav: NavItem[] = useMemo(() => {
    if (role === "admin") {
      return [
        { key: "dashboard", to: "/admin/dashboard", label: t("nav.dashboard", lang), icon: Icons.Dashboard },
        { key: "users", to: "/admin/users", label: "Users", icon: Icons.Users },
        { key: "classes", to: "/admin/classes", label: t("nav.classes", lang), icon: Icons.BookOpen },
        { key: "analytics", to: "/admin/analytics", label: "Analytics", icon: Icons.Chart },
        { key: "settings", to: "/admin/settings", label: t("nav.settings", lang), icon: Icons.Settings },
      ];
    }
    if (role === "teacher") {
      return [
        { key: "dashboard", to: "/teacher/dashboard", label: t("nav.dashboard", lang), icon: Icons.Dashboard },
        { key: "exams", to: "/teacher/exams", label: t("nav.exams", lang), icon: Icons.FileText },
        { key: "question-bank", to: "/teacher/question-bank", label: t("nav.questionBank", lang), icon: Icons.Database },
        { key: "classes", to: "/teacher/classes", label: t("nav.classes", lang), icon: Icons.BookOpen },
        { key: "assignments", to: "/teacher/assignments", label: t("nav.assignments", lang), icon: Icons.ClipboardList },
        { key: "students", to: "/teacher/students", label: t("nav.students", lang), icon: Icons.GraduationCap },
        { key: "analytics", to: "/teacher/analytics", label: "Analytics", icon: Icons.Chart },
        { key: "anti-cheating", to: "/teacher/anti-cheating", label: t("nav.antiCheating", lang), icon: Icons.Shield },
        { key: "settings", to: "/teacher/settings", label: t("nav.settings", lang), icon: Icons.Settings },
      ];
    }
    return [
      { key: "dashboard", to: "/student/dashboard", label: t("nav.dashboard", lang), icon: Icons.Dashboard },
      { key: "classes", to: "/student/classes", label: t("nav.myClasses", lang), icon: Icons.BookOpen },
      { key: "assignments", to: "/student/assignments", label: t("nav.assignments", lang), icon: Icons.ClipboardList },
      { key: "results", to: "/student/results", label: t("nav.myResults", lang), icon: Icons.Chart },
      { key: "settings", to: "/student/settings", label: t("nav.settings", lang), icon: Icons.Settings },
    ];
  }, [lang, role]);

  const effectiveNav: NavItem[] = useMemo(() => {
    if (role === "student" && user?.role === "student" && exam.inProgress && exam.assignmentId) {
      return [
        {
          key: "exam",
          to: `/student/assignments/${exam.assignmentId}/exam`,
          label: "Exam in progress",
          icon: Icons.CheckCircle,
        },
      ];
    }
    return baseNav;
  }, [baseNav, exam.assignmentId, exam.inProgress, role, user?.role]);

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

  const headerActionsGap = role === "admin" ? "gap-3" : "gap-2";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="app-sidebar hidden md:flex shrink-0 flex-col border-r border-border bg-card min-h-screen">
          <div className="px-5 py-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              E
            </div>
            <div className="leading-tight sidebar-brand">
              <div className="text-sm font-semibold text-foreground">{t("app.brand", lang)}</div>
              <div className="text-xs text-muted-foreground">
                {role === "admin" && t("role.admin", lang)}
                {role === "teacher" && t("role.teacher", lang)}
                {role === "student" && t("role.student", lang)}
              </div>
            </div>
          </div>

          <div className="px-5 pb-2">
            <div className={`text-[10px] font-semibold tracking-widest ${roleBadgeClass[role]}`}>
              {roleBadgeLabel[role]}
            </div>
          </div>

          <nav className="px-3 py-2 space-y-1">
            {effectiveNav.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <span className={`text-muted-foreground ${active ? "text-primary" : ""}`}>
                    <Icon />
                  </span>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="relative max-w-lg">
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="h-10 rounded-full border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
                    aria-label={searchPlaceholder}
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Icons.Search />
                  </span>
                </div>
              </div>
              <div className={`flex items-center ${headerActionsGap}`}>
                {role === "teacher" && (
                  <Button size="sm" onClick={() => navigate("/teacher/exams/new")}>
                    <span className="mr-2">
                      <Icons.Plus />
                    </span>
                    {t("common.createExam", lang)}
                  </Button>
                )}
                {!(role === "student" && exam.inProgress) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      logout();
                      navigate("/", { replace: true });
                    }}
                    className="text-muted-foreground"
                  >
                    <span className="mr-2">
                      <Icons.Logout />
                    </span>
                    {t("common.signOut", lang)}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  aria-label="Notifications"
                >
                  <Icons.Bell />
                </Button>
                <div className="h-9 w-9 rounded-full bg-muted text-foreground flex items-center justify-center font-semibold overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={resolveStaticUrl(user.avatar_url)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initials(user?.full_name || user?.email || "", roleInitial[role])
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-6 py-6">
            <div className="admin-page-enter">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
