import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/layouts/Icons";
import { useLocalStorageState } from "@/components/settings/use-local-storage-state";
import { useTheme, type LayoutDensity, type SidebarMode, type ThemeColor } from "@/hooks/useTheme";
import {
  notifyLanguageChanged,
  syncLanguageSettingsStorage,
  t,
  useLanguage,
  type AppTimezone,
  type LanguageCode,
} from "@/i18n";
import { changeMyPassword, uploadMyAvatar } from "@/services/users.service";
import { resolveStaticUrl } from "@/utils/url";

function initials(text: string): string {
  const trimmed = (text || "").trim();
  if (!trimmed) return "U";
  return trimmed[0].toUpperCase();
}

type PasswordStrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

function passwordStrength(pwd: string): { score: number; level: PasswordStrengthLevel } {
  if (!pwd) return { score: 0, level: "empty" };
  let score = 0;
  if (pwd.length >= 6) score += 20;
  if (pwd.length >= 8) score += 10;
  if (pwd.length >= 12) score += 10;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 15;
  score = Math.min(100, score);
  const variety = [/[a-z]/.test(pwd), /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  if (variety <= 1 && pwd.length < 10) {
    score = Math.min(score, 28);
  }
  let level: PasswordStrengthLevel;
  if (score < 30) level = "weak";
  else if (score < 50) level = "fair";
  else if (score < 75) level = "good";
  else level = "strong";
  return { score, level };
}

function newPasswordStrengthLabel(level: PasswordStrengthLevel, lang: LanguageCode): string {
  switch (level) {
    case "empty":
      return t("settings.security.strength.hint", lang);
    case "weak":
      return t("settings.security.strength.weak", lang);
    case "fair":
      return t("settings.security.strength.fair", lang);
    case "good":
      return t("settings.security.strength.good", lang);
    case "strong":
      return t("settings.security.strength.strong", lang);
  }
}

type NotificationsState = {
  examSubmissions: boolean;
  newStudentRegistration: boolean;
  antiCheatingAlerts: boolean;
  weeklyReports: boolean;
  systemUpdates: boolean;
};

type LanguageState = {
  language: LanguageCode;
  timezone: AppTimezone;
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
  const [securitySaving, setSecuritySaving] = useState(false);

  const newPasswordStrength = useMemo(() => passwordStrength(security.next), [security.next]);
  const newPasswordSameAsCurrent =
    security.next.length > 0 && security.current.length > 0 && security.next === security.current;
  const newPasswordMeetsStrength =
    security.next.length >= 6 &&
    newPasswordStrength.level !== "empty" &&
    newPasswordStrength.level !== "weak";
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

  async function saveSecurity() {
    setNotice(null);
    if (!token) {
      setNotice({ kind: "error", message: t("settings.security.notSignedIn", langUi) });
      return;
    }
    if (!security.current.trim()) {
      setNotice({ kind: "error", message: t("settings.security.currentRequired", langUi) });
      return;
    }
    if (!security.next || security.next.length < 6) {
      setNotice({ kind: "error", message: t("settings.security.minLengthError", langUi) });
      return;
    }
    if (security.next === security.current) {
      setNotice({ kind: "error", message: t("settings.security.sameAsCurrent", langUi) });
      return;
    }
    if (newPasswordStrength.level === "weak" || newPasswordStrength.level === "empty") {
      setNotice({ kind: "error", message: t("settings.security.strengthTooWeak", langUi) });
      return;
    }
    if (security.next !== security.confirm) {
      setNotice({ kind: "error", message: t("settings.security.confirmMismatch", langUi) });
      return;
    }
    setSecuritySaving(true);
    try {
      await changeMyPassword(security.current, security.next, token);
      setSecurity({ current: "", next: "", confirm: "" });
      setNotice({ kind: "success", message: t("settings.security.updated", langUi) });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message =
        raw === "Current password is incorrect"
          ? t("settings.security.wrongCurrent", langUi)
          : raw || t("settings.security.updateFailed", langUi);
      setNotice({ kind: "error", message });
    } finally {
      setSecuritySaving(false);
    }
  }
  const themeOptions = [
    { value: "light" as const, label: t("settings.theme.light", langUi), icon: Icons.Sun },
    { value: "dark" as const, label: t("settings.theme.dark", langUi), icon: Icons.Moon },
    { value: "system" as const, label: t("settings.theme.system", langUi), icon: Icons.Monitor },
  ];

  const colorOptions: { value: ThemeColor; label: string; swatch: string }[] = [
    { value: "blue", label: t("settings.themeColor.blue", langUi), swatch: "bg-[hsl(221,83%,53%)]" },
    { value: "green", label: t("settings.themeColor.green", langUi), swatch: "bg-[hsl(142,71%,45%)]" },
    { value: "purple", label: t("settings.themeColor.purple", langUi), swatch: "bg-[hsl(262,83%,58%)]" },
  ];

  const densityOptions: { value: LayoutDensity; label: string; desc: string }[] = [
    { value: "comfortable", label: t("settings.layoutDensity.comfortable", langUi), desc: t("settings.layoutDensity.comfortable.desc", langUi) },
    { value: "compact", label: t("settings.layoutDensity.compact", langUi), desc: t("settings.layoutDensity.compact.desc", langUi) },
  ];

  const sidebarOptions: { value: SidebarMode; label: string; icon: typeof Icons.Maximize2 }[] = [
    { value: "expanded", label: t("settings.sidebar.expanded", langUi), icon: Icons.Maximize2 },
    { value: "collapsed", label: t("settings.sidebar.collapsed", langUi), icon: Icons.Minimize2 },
    { value: "auto", label: t("settings.sidebar.auto", langUi), icon: Icons.PanelLeft },
  ];

  const languageOptions: { value: LanguageCode; label: string; flag: string }[] = [
    { value: "en", label: t("settings.language.english", langUi), flag: "🇺🇸" },
    { value: "vi", label: t("settings.language.vietnamese", langUi), flag: "🇻🇳" },
  ];
  const notificationsOptions = [
    { key: "examSubmissions" as const, title: t("settings.examSubmissions", langUi), desc: t("settings.examSubmissionsDesc", langUi) },
    { key: "newStudentRegistration" as const, title: t("settings.newStudent", langUi), desc: t("settings.newStudentDesc", langUi) },
    { key: "antiCheatingAlerts" as const, title: t("settings.antiCheatAlerts", langUi), desc: t("settings.antiCheatAlertsDesc", langUi) },
    { key: "weeklyReports" as const, title: t("settings.weeklyReports", langUi), desc: t("settings.weeklyReportsDesc", langUi) },
    { key: "systemUpdates" as const, title: t("settings.systemUpdates", langUi), desc: t("settings.systemUpdatesDesc", langUi) },
  ];
  const isCompact = density === "compact";
  const contentCardClass = isCompact ? "p-4 space-y-4" : "p-6 space-y-6";
  const tabsContentClass = isCompact ? "mt-1.5" : "mt-2";
  const sectionStackClass = isCompact ? "space-y-4" : "space-y-5";
  const appearanceSectionClass = isCompact ? "space-y-6" : "space-y-8";
  const sectionTitleClass = isCompact ? "text-sm font-medium text-foreground mb-2 block" : "text-sm font-medium text-foreground mb-3 block";
  const notificationRowClass = isCompact
    ? "bg-background px-3 py-2.5 flex items-start justify-between gap-3"
    : "bg-background px-4 py-3 flex items-start justify-between gap-4";
  async function handleSaveChanges() {
    try {
      // Persist synchronously so listeners read correct timezone before React effect runs.
      syncLanguageSettingsStorage(languageDraft);
      setLanguageSaved(languageDraft);
      await notifyLanguageChanged(languageDraft.language);
      setNotice({ kind: "success", message: t("settings.language.saved", langUi) });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : t("settings.language.saveFailed", langUi) });
    }
  };

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
        className="flex flex-col md:flex-row gap-6"
      >
        {/* Tabs */}
        <div className="md:w-48 shrink-0 space-y-1">
          <TabsList className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        {/* Content */}
        <div className={`flex-1 glass-card ${contentCardClass}`}>
          <div className="text-sm font-semibold text-foreground">{panelTitle}</div>

          {notice && (
            <div
              className={`mt-4 text-sm rounded-xl px-3 py-2 border ${notice.kind === "error"
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

          <TabsContent value="profile" className={tabsContentClass}>
            {!switching && (
              <div className={sectionStackClass}>
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {user?.avatar_url ? (
                      <img
                        src={resolveStaticUrl(user.avatar_url)}
                        alt={t("common.avatarAlt", langUi)}
                        className="size-full object-cover rounded-full"
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
                        setNotice({ kind: "success", message: t("settings.profile.avatarUpdated", langUi) });
                      } catch (err) {
                        setNotice({ kind: "error", message: err instanceof Error ? err.message : t("settings.profile.uploadFailed", langUi) });
                      } finally {
                        // allow re-selecting same file
                        if (fileRef.current) fileRef.current.value = "";
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="rounded-lg text-xs"
                    onClick={() => fileRef.current?.click()}
                  >
                    {t("settings.profile.changePhoto", langUi)}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{t("settings.profile.fullName", langUi)}</label>
                    <Input value={user?.full_name || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t("settings.profile.email", langUi)}</label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{t("settings.profile.school", langUi)}</label>
                    <Input
                      value={profileLocal.school}
                      onChange={(e) => setProfileLocal((p) => ({ ...p, school: e.target.value }))}
                      placeholder={t("settings.profile.schoolPlaceholder", langUi)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{t("settings.profile.subject", langUi)}</label>
                    <Input
                      value={profileLocal.subject}
                      onChange={(e) => setProfileLocal((p) => ({ ...p, subject: e.target.value }))}
                      placeholder={t("settings.profile.subjectPlaceholder", langUi)}
                    />
                  </div>
                </div>


                <div className="space-y-1.5">
                  <Button
                    className="gap-1.5 rounded-lg"
                    size="sm"
                    type="button"
                    onClick={() => setNotice({ kind: "success", message: t("settings.profile.saveSuccess", langUi) })}
                  >
                    <Icons.Save className="size-4" /> {t("settings.button.saveChanges", langUi)}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t("settings.profile.saveHint", langUi)}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className={tabsContentClass}>
            {!switching && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-border divide-y divide-border">
                {notificationsOptions.map((option) => (
                  <div key={option.key} className={notificationRowClass}>
                    <div>
                      <div className="text-sm font-medium text-foreground">{option.title}</div>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                    <div className="pt-0.5">
                      <Switch
                        checked={notifications[option.key as keyof NotificationsState]}
                        onCheckedChange={(v) => setNotifications((n) => ({ ...n, [option.key as keyof NotificationsState]: v }))}
                        aria-label={option.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className={tabsContentClass}>
            {!switching && (
              <div className={`mt-4 max-w-2xl ${sectionStackClass}`}>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">{t("settings.security.currentPassword", langUi)}</label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={security.current}
                    onChange={(e) => setSecurity((s) => ({ ...s, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t("settings.security.newPassword", langUi)}</label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      value={security.next}
                      onChange={(e) => setSecurity((s) => ({ ...s, next: e.target.value }))}
                      placeholder={t("settings.security.minimumLength", langUi)}
                    />
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-300",
                            newPasswordStrength.level === "empty" && "bg-muted-foreground/30",
                            newPasswordStrength.level === "weak" && "bg-destructive",
                            newPasswordStrength.level === "fair" && "bg-orange-500 dark:bg-orange-600",
                            newPasswordStrength.level === "good" && "bg-amber-500 dark:bg-amber-600",
                            newPasswordStrength.level === "strong" && "bg-emerald-600 dark:bg-emerald-500",
                          )}
                          style={{
                            width:
                              newPasswordStrength.level === "empty" && !security.next
                                ? "0%"
                                : `${Math.min(100, Math.max(4, newPasswordStrength.score))}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span
                          className={cn(
                            "text-muted-foreground",
                            newPasswordStrength.level === "weak" && "text-destructive",
                            newPasswordStrength.level === "fair" && "text-orange-600 dark:text-orange-400",
                            newPasswordStrength.level === "good" && "text-amber-600 dark:text-amber-400",
                            newPasswordStrength.level === "strong" && "text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {newPasswordStrengthLabel(newPasswordStrength.level, langUi)}
                        </span>
                      </div>
                    </div>
                    {newPasswordSameAsCurrent && (
                      <p className="text-[11px] text-destructive mt-1">{t("settings.security.sameAsCurrent", langUi)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t("settings.security.confirmPassword", langUi)}</label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      value={security.confirm}
                      onChange={(e) => setSecurity((s) => ({ ...s, confirm: e.target.value }))}
                      placeholder={t("settings.security.confirmPassword", langUi)}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    type="button"
                    disabled={
                      securitySaving ||
                      !newPasswordMeetsStrength ||
                      newPasswordSameAsCurrent ||
                      !security.current.trim()
                    }
                    onClick={() => void saveSecurity()}
                  >
                    <Icons.Key className="size-4" />{" "}
                    {securitySaving ? t("common.saving", langUi) : t("settings.security.updatePassword", langUi)}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="appearance" className={tabsContentClass}>
            {!switching && (
              <div className={appearanceSectionClass}>
                {/* Theme */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{t("settings.theme.title", langUi)}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((themeMode) => (
                      <button
                        type="button"
                        key={themeMode.value}
                        className={`p-4 rounded-lg border text-sm font-medium transition-colors flex flex-col items-center gap-2 ${theme === themeMode.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        onClick={() => setTheme(themeMode.value)}
                      >
                        {themeMode.icon && <themeMode.icon className="size-5" />}
                        {themeMode.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Theme Color */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{t("settings.themeColor.title", langUi)}</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {colorOptions.map((colorMode) => (
                      <button
                        type="button"
                        key={colorMode.value}
                        className={`p-4 rounded-lg border text-sm font-medium transition-colors flex items-center gap-3 ${themeColor === colorMode.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        onClick={() => setThemeColor(colorMode.value)}
                      >
                        <div className={`size-5 rounded-full ${colorMode.swatch} shrink-0`} />
                        {colorMode.label}
                        {themeColor === colorMode.value && <Icons.Check className="size-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Layout density */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{t("settings.layoutDensity.title", langUi)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {densityOptions.map((densityMode) => (
                      <button
                        type="button"
                        key={densityMode.value}
                        className={`p-4 rounded-lg border text-left transition-colors ${density === densityMode.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                          }`}
                        onClick={() => setDensity(densityMode.value)}
                      >
                        <span
                          className={`text-sm font-medium ${density === densityMode.value ? "text-primary" : "text-foreground"}`}>
                          {densityMode.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{densityMode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar mode */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{t("settings.sidebar.title", langUi)}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {sidebarOptions.map((sidebarModeOption) => (
                      <button
                        type="button"
                        key={sidebarModeOption.value}
                        className={`p-4 rounded-lg border text-sm font-medium transition-colors flex flex-col items-center gap-2 ${sidebarMode === sidebarModeOption.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                          }`}
                        onClick={() => setSidebarMode(sidebarModeOption.value)}
                      >
                        {sidebarModeOption.icon && <sidebarModeOption.icon className="size-5 " />}
                        {sidebarModeOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="language" className={tabsContentClass}>
            {!switching && (
              <div>
                <div className={sectionStackClass}>
                  <label className={sectionTitleClass}>{t("settings.language.title", langUi)}</label>
                  <div className="space-y-2">
                    {languageOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLanguageDraft((current) => ({ ...current, language: opt.value }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${languageDraft.language === opt.value
                          ? "bg-primary/10 text-primary font-medium border border-primary/20"
                          : "text-muted-foreground hover:bg-secondary border border-transparent"
                          }`}
                      >
                        <span className="text-lg">{opt.flag}</span>
                        <span>{opt.label}</span>
                        {languageDraft.language === opt.value && <Icons.Check className="size-4 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("settings.language.timezone", langUi)}</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={languageDraft.timezone}
                    onChange={(e) =>
                      setLanguageDraft((l) => ({ ...l, timezone: e.target.value as AppTimezone }))
                    }
                  >
                    <option value="Asia/Ho_Chi_Minh">{t("settings.language.timezone.hcm", langUi)}</option>
                    <option value="Asia/Tokyo">{t("settings.language.timezone.tokyo", langUi)}</option>
                    <option value="America/New_York">{t("settings.language.timezone.newYork", langUi)}</option>
                  </select>
                </div>

                <div className="mt-4">
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-lg"
                    type="button"
                    onClick={handleSaveChanges}
                  >
                    <Icons.Save className="size-4" /> {t("settings.button.saveChanges", langUi)}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

