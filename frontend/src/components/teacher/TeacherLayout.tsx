import type React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../admin/icons";
import { Button } from "../ui/Button";
import { t, useLanguage } from "../../i18n";
import { resolveStaticUrl } from "../../utils/url";

type NavItem = { to: string; label: string; key: string; icon: () => React.ReactElement };

function initials(text: string): string {
  const t = (text || "").trim();
  if (!t) return "T";
  return t[0].toUpperCase();
}

export function TeacherLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = useLanguage();

  const nav: NavItem[] = useMemo(
    () => [
      { key: "dashboard", to: "/teacher/dashboard", label: t("nav.dashboard", lang), icon: Icons.Dashboard },
      { key: "exams", to: "/teacher/exams", label: t("nav.exams", lang), icon: Icons.Book },
      { key: "question-bank", to: "/teacher/question-bank", label: t("nav.questionBank", lang), icon: Icons.Layers },
      { key: "classes", to: "/teacher/classes", label: t("nav.classes", lang), icon: Icons.Layers },
      { key: "assignments", to: "/teacher/assignments", label: t("nav.assignments", lang), icon: Icons.Clipboard },
      { key: "students", to: "/teacher/students", label: t("nav.students", lang), icon: Icons.Users },
      { key: "anti-cheating", to: "/teacher/anti-cheating", label: t("nav.antiCheating", lang), icon: Icons.Settings },
      { key: "settings", to: "/teacher/settings", label: t("nav.settings", lang), icon: Icons.Settings },
    ],
    [lang],
  );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <div className="flex">
        <aside className="app-sidebar hidden md:flex shrink-0 flex-col border-r border-[var(--border-soft)] bg-[var(--panel-bg)] min-h-screen">
          <div className="px-5 py-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
              E
            </div>
            <div className="leading-tight sidebar-brand">
              <div className="text-sm font-semibold text-slate-900">{t("app.brand", lang)}</div>
              <div className="text-xs text-slate-500">{t("role.teacher", lang)}</div>
            </div>
          </div>

          <div className="px-5 pb-2">
            <div className="text-[10px] font-semibold text-slate-400 tracking-widest">TEACHER</div>
          </div>

          <nav className="px-3 py-2 space-y-1">
            {nav.map((item) => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "text-slate-600 hover:text-[var(--text)] hover:bg-[var(--primary-soft)]"
                  }`}
                >
                  <span className={`text-slate-500 ${active ? "text-[var(--primary)]" : ""}`}>
                    <Icon />
                  </span>
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[var(--panel-bg-80)] backdrop-blur">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="relative max-w-lg">
                  <input
                    type="text"
                    placeholder={t("common.searchPlaceholderTeacher", lang)}
                    className="w-full h-10 rounded-full bg-[var(--app-bg)] border border-[var(--border-soft)] px-4 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-ring)] transition text-[var(--text)] placeholder:text-slate-400"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Search />
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => navigate("/teacher/exams/new")}>
                  <span className="mr-2">
                    <Icons.Plus />
                  </span>
                  {t("common.createExam", lang)}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/", { replace: true });
                  }}
                  className="text-slate-600"
                >
                  <span className="mr-2">
                    <Icons.Logout />
                  </span>
                  {t("common.signOut", lang)}
                </Button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl hover:bg-[var(--primary-soft)] text-slate-500 hover:text-[var(--text)] transition-colors"
                  aria-label="Notifications"
                >
                  <Icons.Bell />
                </button>
                <div className="h-9 w-9 rounded-full bg-[var(--border-soft)] text-[var(--text)] flex items-center justify-center font-semibold overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={resolveStaticUrl(user.avatar_url)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initials(user?.full_name || user?.email || "T")
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-[var(--page-px)] py-[var(--page-py)]">
            <div className="admin-page-enter">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

