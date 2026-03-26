import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/layouts/icons";
import { useLocalStorageState } from "@/components/settings/use-local-storage-state";
import { useTheme } from "@/hooks/useTheme";
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

type LanguageState = {
  language: "en" | "vi";
  timezone: "Asia/Ho_Chi_Minh" | "UTC";
};
type SettingsTab = "profile" | "notifications" | "security" | "appearance" | "language";

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

  const { theme, setTheme, themeColor, setThemeColor, density, setDensity, sidebarMode, setSidebarMode } = useTheme();

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

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setNotice(null);
          setTab(value as SettingsTab);
        }}
        className="flex flex-col gap-6 md:flex-row"
      >
        <div className="md:w-56 shrink-0 space-y-1">
          <TabsList className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon />
                  <span>{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <Card className="flex-1 p-6">
          <div className="settings-panel-enter">
            <div className="text-sm font-semibold text-foreground">{panelTitle}</div>

            {notice && (
              <div
                className={`mt-4 text-sm rounded-xl px-3 py-2 border ${
                  notice.kind === "error"
                    ? "text-destructive bg-destructive/10 border-destructive/20"
                    : "text-primary bg-primary/10 border-primary/20"
                }`}
              >
                {notice.message}
              </div>
            )}

            {switching && (
              <div className="mt-4 space-y-3 animate-pulse">
                <div className="h-10 bg-muted rounded-xl" />
                <div className="h-10 bg-muted rounded-xl" />
                <div className="h-10 bg-muted rounded-xl" />
                <div className="h-10 bg-muted rounded-xl w-2/3" />
              </div>
            )}

            <TabsContent value="profile">
            {!switching && (
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
                    <label className="block text-xs font-medium text-foreground mb-1">Full Name</label>
                    <Input value={user?.full_name || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">School</label>
                    <Input
                      value={profileLocal.school}
                      onChange={(e) => setProfileLocal((p) => ({ ...p, school: e.target.value }))}
                      placeholder="e.g. Ha Noi High School"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Subject</label>
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
                  <div className="mt-2 text-xs text-muted-foreground">
                    Note: Some profile fields are saved locally for MVP UI (backend sync not implemented).
                  </div>
                </div>
              </div>
            )}
            </TabsContent>

            <TabsContent value="notifications">
            {!switching && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border divide-y divide-border">
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
                  <div key={row.key} className="bg-background px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{row.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{row.desc}</div>
                    </div>
                    <div className="pt-0.5">
                      <Switch
                        checked={notifications[row.key]}
                        onCheckedChange={(v) => setNotifications((n) => ({ ...n, [row.key]: v }))}
                        aria-label={row.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            </TabsContent>

            <TabsContent value="security">
            {!switching && (
              <div className="mt-4 space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Current Password</label>
                  <Input
                    type="password"
                    value={security.current}
                    onChange={(e) => setSecurity((s) => ({ ...s, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">New Password</label>
                    <Input
                      type="password"
                      value={security.next}
                      onChange={(e) => setSecurity((s) => ({ ...s, next: e.target.value }))}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Confirm Password</label>
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
                  <div className="mt-2 text-xs text-muted-foreground">
                    MVP note: This tab is UI-ready. If you want real password update, we’ll add a backend endpoint later.
                  </div>
                </div>
              </div>
            )}
            </TabsContent>

            <TabsContent value="appearance">
            {!switching && (
              <div className="mt-4 space-y-5">
                <div>
                  <div className="mb-2 text-xs font-semibold text-foreground">Theme</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(["light", "dark", "system"] as const).map((themeMode) => (
                      <Button
                        key={themeMode}
                        type="button"
                        variant={theme === themeMode ? "secondary" : "outline"}
                        className="h-auto justify-start p-4"
                        onClick={() => setTheme(themeMode)}
                      >
                        {themeMode}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-foreground">Theme Color</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(["blue", "green", "purple"] as const).map((colorMode) => (
                      <Button
                        key={colorMode}
                        type="button"
                        variant={themeColor === colorMode ? "secondary" : "outline"}
                        className="h-auto justify-start p-4 capitalize"
                        onClick={() => setThemeColor(colorMode)}
                      >
                        {colorMode}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-foreground">Layout Density</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["comfortable", "compact"] as const).map((densityMode) => (
                      <Button
                        key={densityMode}
                        type="button"
                        variant={density === densityMode ? "secondary" : "outline"}
                        className="h-auto justify-start p-4 capitalize"
                        onClick={() => setDensity(densityMode)}
                      >
                        {densityMode}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold text-foreground">Sidebar Mode</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(["expanded", "collapsed", "auto"] as const).map((sidebarModeOption) => (
                      <Button
                        key={sidebarModeOption}
                        type="button"
                        variant={sidebarMode === sidebarModeOption ? "secondary" : "outline"}
                        className="h-auto justify-start p-4 capitalize"
                        onClick={() => setSidebarMode(sidebarModeOption)}
                      >
                        {sidebarModeOption}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button size="sm" variant="secondary" type="button" onClick={() => setNotice({ kind: "success", message: "Appearance saved (local preferences)." })}>
                    Save Changes
                  </Button>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Appearance options are stored locally and applied immediately.
                  </div>
                </div>
              </div>
            )}
            </TabsContent>

            <TabsContent value="language">
            {(
              <div className="mt-4 space-y-4 max-w-2xl">
                <div>
                  <div className="text-sm font-semibold text-foreground">{t("settings.language.title", langUi)}</div>
                  <div className="mt-2 overflow-hidden rounded-2xl border border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setLanguageDraft((l) => ({ ...l, language: "en" }))}
                      className={`w-full justify-between px-4 py-3 h-auto rounded-none text-sm font-normal transition ${
                        languageDraft.language === "en"
                          ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                          : "bg-card hover:bg-background text-foreground"
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
                          : "bg-card hover:bg-background text-foreground"
                      }`}
                    >
                      <span>Tiếng Việt</span>
                      {languageDraft.language === "vi" ? <span className="text-primary">✓</span> : null}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("settings.language.timezone", langUi)}</label>
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
            </TabsContent>
          </div>
        </Card>
      </Tabs>
    </div>
  );
}

