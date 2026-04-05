import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useExam } from "@/context";
import { Icons } from "@/components/layouts/Icons";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/i18n";
import { resolveStaticUrl } from "@/utils/url";
import { roleInitial, type DashboardRole } from "@/components/layouts/NavLinks";

function initials(text: string, fallback: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return fallback;
  return trimmed[0].toUpperCase();
}

export type TopNavBarProps = {
  role: DashboardRole;
  searchPlaceholder: string;
};

export function TopNavBar({ role, searchPlaceholder }: TopNavBarProps) {
  const { user, logout } = useAuth();
  const exam = useExam();
  const navigate = useNavigate();
  const lang = useLanguage();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search */}
      <div className="search-input w-72">
        <Icons.Search className="size-4" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
          aria-label={searchPlaceholder}
        />
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>
      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {role === "teacher" && (
          <Button
            size="sm"
            className="gap-1.5 rounded-lg text-sm font-medium"
            onClick={() => navigate("/teacher/exams/new")}
          >
            <Icons.Plus className="size-4" />
            <span className="hidden sm:inline">{t("common.createExam", lang)}</span>
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
            className="gap-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Icons.Logout className="size-4" />
            <span className="hidden sm:inline">{t("common.signOut", lang)}</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label={t("common.notifications", lang)}
        >
          <Icons.Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full size-2" />
        </Button>
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary cursor-pointer">
          {user?.avatar_url ? (
            <img
              src={resolveStaticUrl(user.avatar_url)}
              alt={t("common.avatarAlt", lang)}
              className="size-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            initials(user?.full_name || user?.email || "", roleInitial[role])
          )}
        </div>
      </div>
    </header>
  );
}
