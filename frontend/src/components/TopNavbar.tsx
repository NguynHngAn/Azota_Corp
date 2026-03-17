import { Search, Bell, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export function TopNavbar() {
  const { role, profile } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search */}
      <div className="search-input w-72">
        <Search className="w-4 h-4" />
        <input
          type="text"
          placeholder={t("search.placeholder")}
          className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {role === "teacher" && (
          <Link to="/exams/create">
            <Button
              size="sm"
              className="gap-1.5 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("btn.createExam")}</span>
            </Button>
          </Link>
        )}

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary cursor-pointer">
          {profile?.display_name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
