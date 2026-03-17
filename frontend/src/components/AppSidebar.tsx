import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Database,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  ChevronLeft,
  BookOpen,
  Shield,
  LogOut,
  School,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useIsMobile } from "@/hooks/useMobile";

export function AppSidebar() {
  const location = useLocation();
  const { role, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const { sidebarMode } = useTheme();
  const isMobile = useIsMobile();

  const [collapsed, setCollapsed] = useState(() => {
    if (sidebarMode === "collapsed") return true;
    if (sidebarMode === "expanded") return false;
    return isMobile; // auto
  });

  // React to sidebarMode changes
  useEffect(() => {
    if (sidebarMode === "collapsed") setCollapsed(true);
    else if (sidebarMode === "expanded") setCollapsed(false);
    else setCollapsed(isMobile); // auto
  }, [sidebarMode, isMobile]);

  const teacherNav = [
    { title: t("nav.dashboard"), icon: LayoutDashboard, path: "/" },
    { title: t("nav.exams"), icon: FileText, path: "/exams" },
    { title: t("nav.questionBank"), icon: Database, path: "/questions" },
    { title: t("nav.classes"), icon: BookOpen, path: "/classes" },
    { title: t("nav.students"), icon: GraduationCap, path: "/students" },
    { title: t("nav.analytics"), icon: BarChart3, path: "/analytics" },
    { title: t("nav.antiCheating"), icon: Shield, path: "/anti-cheating" },
    { title: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  const studentNav = [
    { title: t("nav.dashboard"), icon: LayoutDashboard, path: "/" },
    { title: t("nav.myClasses"), icon: BookOpen, path: "/classes" },
    { title: t("nav.myResults"), icon: BarChart3, path: "/results" },
    { title: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  const adminNav = [
    { title: t("nav.dashboard"), icon: LayoutDashboard, path: "/" },
    { title: t("nav.users"), icon: Users, path: "/admin/users" },
    { title: t("nav.schools"), icon: School, path: "/admin/schools" },
    { title: t("nav.exams"), icon: FileText, path: "/exams" },
    { title: t("nav.analytics"), icon: BarChart3, path: "/analytics" },
    { title: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  const navItems =
    role === "admin" ? adminNav : role === "student" ? studentNav : teacherNav;

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col border-r border-border bg-card transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">EduFlow</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && role && (
        <div className="px-4 py-2">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              role === "admin"
                ? "text-destructive"
                : role === "teacher"
                  ? "text-primary"
                  : "text-success"
            }`}
          >
            {role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-border">
        {!collapsed && profile && (
          <div className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {profile.display_name?.slice(0, 2).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {profile.display_name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {profile.email}
              </div>
            </div>
          </div>
        )}
        <div className="px-3 pb-3 flex items-center gap-1">
          <button
            onClick={signOut}
            className="nav-item flex-1 text-destructive hover:bg-destructive/10"
            title={t("nav.signOut")}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>{t("nav.signOut")}</span>}
          </button>
          {sidebarMode !== "collapsed" && sidebarMode !== "expanded" && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="nav-item justify-center px-2"
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
