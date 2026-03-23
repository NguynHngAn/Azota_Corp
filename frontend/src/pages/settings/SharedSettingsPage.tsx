import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/icons";
import { SettingsTabsNav, type SettingsTab } from "@/components/settings/settings-tabs-nav";
import { Toggle } from "@/components/settings/toggle";
import { OptionCard } from "@/components/settings/option-card";
import { useLocalStorageState } from "@/components/settings/use-local-storage-state";
import { notifyLanguageChanged, t, useLanguage } from "@/i18n";
import { uploadMyAvatar } from "@/services/users.service";
import { resolveStaticUrl } from "@/utils/url";

function initials(text: string): string {
  const t = (text || "").trim();
  if (!t) return "U";
  return t[0].toUpperCase();
}

type NotificationsState = {
  examSubmissions: boolean;
  newStudentRegistration: boolean;
  antiCheatingAlerts: boolean;
  weeklyReports: boolean;
  systemUpdates: boolean;
};

type AppearanceState = {
  theme: "light" | "dark" | "system";
  color: "blue" | "green" | "purple";
  density: "comfortable" | "compact";
  sidebarMode: "expanded" | "collapsed" | "auto";
};

type LanguageState = {
  language: "en" | "vi";
  timezone: "Asia/Ho_Chi_Minh" | "UTC";
};

export function SharedSettingsPage() {
  const { user, token, refreshMe } = useAuth();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [switching, setSwitching] = useState(false);
  const langUi = useLanguage();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [notifications, setNotifications] = useLocalStorageState<NotificationsState>("settings.notifications", {
    examSubmissions: true,
    newStudentRegistration: true,
    antiCheatingAlerts: true,
    weeklyReports: false,
    systemUpdates: false,
  });

  const [appearance, setAppearance] = useLocalStorageState<AppearanceState>("settings.appearance", {
    theme: "system",
    color: "blue",
    density: "comfortable",
    sidebarMode: "expanded",
  });

  // Persisted language settings (applied app-wide). Changes should only apply after clicking "Save Changes".
  const [languageSaved, setLanguageSaved] = useLocalStorageState<LanguageState>("settings.language", {
    language: "en",
    timezone: "Asia/Ho_Chi_Minh",
  });
  // Draft language settings (UI-only until saved).
  const [languageDraft, setLanguageDraft] = useState<LanguageState>(languageSaved);

  useEffect(() => {
    setLanguageDraft(languageSaved);
  }, [languageSaved.language, languageSaved.timezone]);

  const [profileLocal, setProfileLocal] = useLocalStorageState<{ school: string; subject: string }>("settings.profile", {
    school: "",
    subject: "",
  });

  const [security, setSecurity] = useState({ current: "", next: "", confirm: "" });
  const [notice, setNotice] = useState<null | { kind: "success" | "error"; message: string }>(null);

  const navItems = useMemo(
    () => [
      { id: "profile" as const, label: t("settings.tab.profile", langUi), icon: Icons.User },
      { id: "notifications" as const, label: t("settings.tab.notifications", langUi), icon: Icons.Bell },
      { id: "security" as const, label: t("settings.tab.security", langUi), icon: Icons.Shield },
      { id: "appearance" as const, label: t("settings.tab.appearance", langUi), icon: Icons.Palette },
      { id: "language" as const, label: t("settings.tab.language", langUi), icon: Icons.Globe },
    ],
    [langUi],
  );

  const panelTitle = useMemo(() => {
    switch (tab) {
      case "profile":
        return t("settings.panel.profile", langUi);
      case "notifications":
        return t("settings.panel.notifications", langUi);
      case "security":
        return t("settings.panel.security", langUi);
      case "appearance":
        return t("settings.panel.appearance", langUi);
      case "language":
        return t("settings.panel.language", langUi);
      default:
        return "";
    }
  }, [langUi, tab]);

  useEffect(() => {
    setSwitching(true);
    const t = window.setTimeout(() => setSwitching(false), 160);
    return () => window.clearTimeout(t);
  }, [tab]);

  // Apply appearance immediately (MVP: local preferences -> global UI behavior).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = appearance.density;
    root.dataset.sidebar = appearance.sidebarMode;
    root.dataset.themeColor = appearance.color;

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const useDark = appearance.theme === "dark" || (appearance.theme === "system" && prefersDark);
    root.classList.toggle("dark", useDark);
  }, [appearance.color, appearance.density, appearance.sidebarMode, appearance.theme]);
  // Language is applied only when user clicks "Save Changes" in Language tab.

  function saveSecurity() {
    setNotice(null);
    if (!security.next || security.next.length < 6) {
      setNotice({ kind: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (security.next !== security.confirm) {
      setNotice({ kind: "error", message: "Password confirmation does not match." });
      return;
    }
    // UI-only: backend endpoint for self password change is not implemented.
    setSecurity({ current: "", next: "", confirm: "" });
    setNotice({ kind: "success", message: "Password updated (saved locally for MVP UI)." });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("settings.title", langUi)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle", langUi)}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 shrink-0 space-y-1">
          <SettingsTabsNav
            tab={tab}
            onChange={(t) => {
              setNotice(null);
              setTab(t);
            }}
            items={navItems}
          />
        </div>
        {/* Content */}
        <div className="flex-1 glass-card p-6">
          <div className="settings-panel-enter">
            <div className="text-sm font-semibold text-slate-900">{panelTitle}</div>

            {notice && (
              <div
                className={`mt-4 text-sm rounded-xl px-3 py-2 border ${
                  notice.kind === "error"
                    ? "text-rose-700 bg-rose-50 border-rose-100"
                    : "text-emerald-800 bg-emerald-50 border-emerald-100"
                }`}
              >
                {notice.message}
              </div>
            )}

            {switching && (
              <div className="mt-4 space-y-3 animate-pulse">
                <div className="h-10 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl w-2/3" />
              </div>
            )}

            {!switching && tab === "profile" && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={resolveStaticUrl(user.avatar_url)}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      initials(user?.full_name || user?.email || "U")
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f || !token) return;
                      setNotice(null);
                      try {
                        await uploadMyAvatar(f, token);
                        await refreshMe();
                        setNotice({ kind: "success", message: "Avatar updated." });
                      } catch (err) {
                        setNotice({ kind: "error", message: err instanceof Error ? err.message : "Upload failed" });
                      } finally {
                        // allow re-selecting same file
                        if (fileRef.current) fileRef.current.value = "";
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <Input value={user?.full_name || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">School</label>
                    <Input
                      value={profileLocal.school}
                      onChange={(e) => setProfileLocal((p) => ({ ...p, school: e.target.value }))}
                      placeholder="e.g. Ha Noi High School"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                    <Input
                      value={profileLocal.subject}
                      onChange={(e) => setProfileLocal((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setNotice({ kind: "success", message: "Saved changes (local preferences)." })}
                  >
                    Save Changes
                  </Button>
                  <div className="mt-2 text-xs text-slate-500">
                    Note: Some profile fields are saved locally for MVP UI (backend sync not implemented).
                  </div>
                </div>
              </div>
            )}

            {!switching && tab === "notifications" && (
              <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
                {[
                  {
                    key: "examSubmissions" as const,
                    title: "Exam submissions",
                    desc: "Get notified when students submit exams",
                  },
                  {
                    key: "newStudentRegistration" as const,
                    title: "New student registration",
                    desc: "Alert when new students join your class",
                  },
                  {
                    key: "antiCheatingAlerts" as const,
                    title: "Anti-cheating alerts",
                    desc: "Real-time alerts for suspicious activity",
                  },
                  {
                    key: "weeklyReports" as const,
                    title: "Weekly reports",
                    desc: "Summary of performance every week",
                  },
                  {
                    key: "systemUpdates" as const,
                    title: "System updates",
                    desc: "Platform news and feature updates",
                  },
                ].map((row) => (
                  <div key={row.key} className="bg-white px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{row.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{row.desc}</div>
                    </div>
                    <div className="pt-0.5">
                      <Toggle
                        checked={notifications[row.key]}
                        onChange={(v) => setNotifications((n) => ({ ...n, [row.key]: v }))}
                        label={row.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!switching && tab === "security" && (
              <div className="mt-4 space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
                  <Input
                    type="password"
                    value={security.current}
                    onChange={(e) => setSecurity((s) => ({ ...s, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                    <Input
                      type="password"
                      value={security.next}
                      onChange={(e) => setSecurity((s) => ({ ...s, next: e.target.value }))}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
                    <Input
                      type="password"
                      value={security.confirm}
                      onChange={(e) => setSecurity((s) => ({ ...s, confirm: e.target.value }))}
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button size="sm" type="button" onClick={saveSecurity}>
                    Update Password
                  </Button>
                  <div className="mt-2 text-xs text-slate-500">
                    MVP note: This tab is UI-ready. If you want real password update, we’ll add a backend endpoint later.
                  </div>
                </div>
              </div>
            )}

            {!switching && tab === "appearance" && (
              <div className="mt-4 space-y-5">
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Theme</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <OptionCard
                      title="Light"
                      description="Bright and clear"
                      icon={<Icons.Sun />}
                      selected={appearance.theme === "light"}
                      onSelect={() => setAppearance((a) => ({ ...a, theme: "light" }))}
                    />
                    <OptionCard
                      title="Dark"
                      description="Dim and focused"
                      icon={<Icons.Moon />}
                      selected={appearance.theme === "dark"}
                      onSelect={() => setAppearance((a) => ({ ...a, theme: "dark" }))}
                    />
                    <OptionCard
                      title="System"
                      description="Match device"
                      icon={<Icons.Monitor />}
                      selected={appearance.theme === "system"}
                      onSelect={() => setAppearance((a) => ({ ...a, theme: "system" }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Theme Color</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <OptionCard
                      title="Blue"
                      selected={appearance.color === "blue"}
                      onSelect={() => setAppearance((a) => ({ ...a, color: "blue" }))}
                      icon={<span className="h-3 w-3 rounded-full bg-primary inline-block" />}
                    />
                    <OptionCard
                      title="Green"
                      selected={appearance.color === "green"}
                      onSelect={() => setAppearance((a) => ({ ...a, color: "green" }))}
                      icon={<span className="h-3 w-3 rounded-full bg-emerald-600 inline-block" />}
                    />
                    <OptionCard
                      title="Purple"
                      selected={appearance.color === "purple"}
                      onSelect={() => setAppearance((a) => ({ ...a, color: "purple" }))}
                      icon={<span className="h-3 w-3 rounded-full bg-violet-600 inline-block" />}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Layout Density</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <OptionCard
                      title="Comfortable"
                      description="More spacing, larger elements"
                      selected={appearance.density === "comfortable"}
                      onSelect={() => setAppearance((a) => ({ ...a, density: "comfortable" }))}
                    />
                    <OptionCard
                      title="Compact"
                      description="Tighter spacing, more content"
                      selected={appearance.density === "compact"}
                      onSelect={() => setAppearance((a) => ({ ...a, density: "compact" }))}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Sidebar Mode</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <OptionCard
                      title="Expanded"
                      selected={appearance.sidebarMode === "expanded"}
                      onSelect={() => setAppearance((a) => ({ ...a, sidebarMode: "expanded" }))}
                    />
                    <OptionCard
                      title="Collapsed"
                      selected={appearance.sidebarMode === "collapsed"}
                      onSelect={() => setAppearance((a) => ({ ...a, sidebarMode: "collapsed" }))}
                    />
                    <OptionCard
                      title="Auto"
                      selected={appearance.sidebarMode === "auto"}
                      onSelect={() => setAppearance((a) => ({ ...a, sidebarMode: "auto" }))}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button size="sm" variant="secondary" type="button" onClick={() => setNotice({ kind: "success", message: "Appearance saved (local preferences)." })}>
                    Save Changes
                  </Button>
                  <div className="mt-2 text-xs text-slate-500">
                    MVP note: Appearance options are stored locally. If you want real theming applied across the app, we can wire it next.
                  </div>
                </div>
              </div>
            )}

            {tab === "language" && (
              <div className="mt-4 space-y-4 max-w-2xl">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t("settings.language.title", langUi)}</div>
                  <div className="mt-2 rounded-2xl border border-slate-100 overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setLanguageDraft((l) => ({ ...l, language: "en" }))}
                      className={`w-full justify-between px-4 py-3 h-auto rounded-none text-sm font-normal transition ${
                        languageDraft.language === "en"
                          ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                          : "bg-card hover:bg-background text-slate-700"
                      }`}
                    >
                      <span>English</span>
                      {languageDraft.language === "en" ? <span className="text-primary">✓</span> : null}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setLanguageDraft((l) => ({ ...l, language: "vi" }))}
                      className={`w-full justify-between px-4 py-3 h-auto rounded-none text-sm font-normal transition border-t border-border ${
                        languageDraft.language === "vi"
                          ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                          : "bg-card hover:bg-background text-slate-700"
                      }`}
                    >
                      <span>Tiếng Việt</span>
                      {languageDraft.language === "vi" ? <span className="text-primary">✓</span> : null}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{t("settings.language.timezone", langUi)}</label>
                  <select
                    value={languageDraft.timezone}
                    onChange={(e) =>
                      setLanguageDraft((l) => ({ ...l, timezone: e.target.value as LanguageState["timezone"] }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setLanguageSaved(languageDraft);
                      notifyLanguageChanged(languageDraft.language);
                      setNotice({ kind: "success", message: "Language settings saved (local preferences)." });
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

