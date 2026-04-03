import { Link } from "react-router";
import { t, useLanguage } from "@/i18n";
import {
  type DashboardRole,
  type NavItem,
} from "@/components/layouts/NavLinks";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useMobile } from "@/hooks/use-mobile";
import { Icons } from "./Icons";
import { useAuth } from "@/context/AuthContext";
import { resolveStaticUrl } from "@/utils/url";

function pathMatchesNav(pathname: string, toPath: string): boolean {
  return pathname === toPath || pathname.startsWith(`${toPath}/`);
}

/** Supports `to` with query (e.g. /teacher/analytics?tab=anti-cheat) for tab deep-links. */
function isNavItemActive(pathname: string, search: string, to: string): boolean {
  const q = to.indexOf("?");
  const toPath = q === -1 ? to : to.slice(0, q);
  const toQuery = q === -1 ? undefined : to.slice(q + 1);
  if (!pathMatchesNav(pathname, toPath)) return false;
  const cur = new URLSearchParams(search);
  if (toQuery === undefined) {
    if (toPath === "/teacher/analytics") return cur.get("tab") !== "anti-cheat";
    return true;
  }
  const want = new URLSearchParams(toQuery);
  for (const [k, v] of want) {
    if (cur.get(k) !== v) return false;
  }
  return true;
}

export type AppSidebarProps = {
  role: DashboardRole;
  items: NavItem[];
  pathname: string;
  search: string;
};



export function AppSidebar({ role, items, pathname, search }: AppSidebarProps) {
  const {user} = useAuth();
  const { sidebarMode } = useTheme();
  const isMobile = useMobile();

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

  const lang = useLanguage();
  const roleLabel = t(`role.${role}` as const, lang);

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
              <Icons.GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">{t("app.brand", lang)}</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Icons.GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>
      {/* Role badge */}
      {!collapsed && role && (
        <div className="px-4 py-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
            role === "admin" ? "text-destructive" : role === "teacher" ? "text-primary" : "text-success"
          }`}>
            {roleLabel}
          </span>
        </div>
      )}

      {/* Navigation */}  
      <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = isNavItemActive(pathname, search, item.to);
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item ${active ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
               title={collapsed ? item.label : undefined}
            >
               <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      {/* User + collapse */}
      <div className="border-t border-border flex flex-row justify-between items-center ">
        {!collapsed && user && (
          <div className="p-3 flex items-center gap-3 ">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {user.avatar_url
                ? <img src={resolveStaticUrl(user.avatar_url)} alt={t("common.avatarAlt", lang)} className="size-full object-cover rounded-full" />
                : user.full_name?.slice(0, 2).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        )}
        <div className="flex justify-center px-4">
          {sidebarMode !== "collapsed" && sidebarMode !== "expanded" && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="nav-item justify-center px-2 text-muted-foreground hover:text-primary"
            >
              <Icons.ChevronLeft
                className={
                  `size-4 transition-transform duration-200 relative
                  ${collapsed
                    ? "rotate-180 "
                    : ""}`
                } />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
