import type { ComponentType } from "react";
import { Icons } from "@/components/layouts/Icons";
import { t, type LanguageCode } from "@/i18n";

export type DashboardRole = "admin" | "teacher" | "student";

export type NavItem = {
  to: string;
  label: string;
  key: string;
  icon: ComponentType<{ className?: string }>;
};

export const roleBadgeClass: Record<DashboardRole, string> = {
  admin: "text-destructive",
  teacher: "text-success",
  student: "text-warning",
};

export const roleBadgeLabel: Record<DashboardRole, string> = {
  admin: "ADMIN",
  teacher: "TEACHER",
  student: "STUDENT",
};

export const roleInitial: Record<DashboardRole, string> = {
  admin: "A",
  teacher: "T",
  student: "S",
};

export function getBaseNavItems(role: DashboardRole, lang: LanguageCode): NavItem[] {
  if (role === "admin") {
    return [
      { key: "dashboard", to: "/admin/dashboard", label: t("nav.dashboard", lang), icon: Icons.Dashboard },
      { key: "users", to: "/admin/users", label: t("nav.users", lang), icon: Icons.Users },
      {
        key: "accountRequests",
        to: "/admin/account-requests",
        label: t("nav.accountRequests", lang),
        icon: Icons.UserPlus,
      },
      { key: "classes", to: "/admin/classes", label: t("nav.classes", lang), icon: Icons.BookOpen },
      { key: "analytics", to: "/admin/analytics", label: t("nav.analytics", lang), icon: Icons.Chart },
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
      { key: "analytics", to: "/teacher/analytics", label: t("nav.analytics", lang), icon: Icons.Chart },
      { key: "anti-cheating", to: "/teacher/anti-cheating", label: t("nav.antiCheating", lang), icon: Icons.Shield },
      { key: "trash", to: "/teacher/trash", label: "Trash", icon: Icons.Trash2 },
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
}

export function getEffectiveNavItems(
  baseNav: NavItem[],
  options: {
    role: DashboardRole;
    userRole?: string;
    inProgress: boolean;
    assignmentId: number | null;
  }
): NavItem[] {
  const { role, userRole, inProgress, assignmentId } = options;
  if (role === "student" && userRole === "student" && inProgress && assignmentId != null) {
    return [
      {
        key: "exam",
        to: `/student/assignments/${assignmentId}/exam`,
        label: t("nav.examInProgress"),
        icon: Icons.CheckCircle,
      },
    ];
  }
  return baseNav;
}
