import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Save,
  Sun,
  Moon,
  Monitor,
  Check,
  Maximize2,
  Minimize2,
  PanelLeft,
} from "lucide-react";
import { useState } from "react";
import {
  useTheme,
  ThemeColor,
  LayoutDensity,
  SidebarMode,
} from "@/hooks/useTheme";
import { useLanguage, Language } from "@/hooks/useLanguage";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const {
    theme,
    setTheme,
    themeColor,
    setThemeColor,
    density,
    setDensity,
    sidebarMode,
    setSidebarMode,
  } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const tabs = [
    { id: "profile", label: t("settings.profile"), icon: User },
    { id: "notifications", label: t("settings.notifications"), icon: Bell },
    { id: "security", label: t("settings.security"), icon: Shield },
    { id: "appearance", label: t("settings.appearance"), icon: Palette },
    { id: "language", label: t("settings.language"), icon: Globe },
  ];

  const themeOptions = [
    { value: "light" as const, label: t("settings.light"), icon: Sun },
    { value: "dark" as const, label: t("settings.dark"), icon: Moon },
    { value: "system" as const, label: t("settings.system"), icon: Monitor },
  ];

  const colorOptions: { value: ThemeColor; label: string; swatch: string }[] = [
    { value: "blue", label: "Blue", swatch: "bg-[hsl(221,83%,53%)]" },
    { value: "green", label: "Green", swatch: "bg-[hsl(142,71%,45%)]" },
    { value: "purple", label: "Purple", swatch: "bg-[hsl(262,83%,58%)]" },
  ];

  const densityOptions: {
    value: LayoutDensity;
    label: string;
    desc: string;
  }[] = [
    {
      value: "comfortable",
      label: "Comfortable",
      desc: "More spacing, larger elements",
    },
    {
      value: "compact",
      label: "Compact",
      desc: "Tighter spacing, more content",
    },
  ];

  const sidebarOptions: {
    value: SidebarMode;
    label: string;
    icon: typeof Maximize2;
  }[] = [
    { value: "expanded", label: "Expanded", icon: Maximize2 },
    { value: "collapsed", label: "Collapsed", icon: Minimize2 },
    { value: "auto", label: "Auto", icon: PanelLeft },
  ];

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: "en", label: "English", flag: "🇺🇸" },
    { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  ];

  const notifications = [
    {
      label: t("settings.examSubmissions"),
      desc: t("settings.examSubmissionsDesc"),
    },
    { label: t("settings.newStudent"), desc: t("settings.newStudentDesc") },
    {
      label: t("settings.antiCheatAlerts"),
      desc: t("settings.antiCheatAlertsDesc"),
    },
    {
      label: t("settings.weeklyReports"),
      desc: t("settings.weeklyReportsDesc"),
    },
    {
      label: t("settings.systemUpdates"),
      desc: t("settings.systemUpdatesDesc"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("settings.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("settings.subtitle")}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs */}
          <div className="md:w-48 shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item w-full ${activeTab === tab.id ? "active" : ""}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 glass-card p-6">
            {activeTab === "profile" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("settings.profileInfo")}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    T
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs"
                    >
                      {t("settings.changePhoto")}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("settings.fullName")}
                    </label>
                    <input
                      defaultValue="Teacher Nguyen"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("settings.email")}
                    </label>
                    <input
                      defaultValue="teacher@school.edu"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("settings.school")}
                    </label>
                    <input
                      defaultValue="Ha Noi High School"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("settings.subject")}
                    </label>
                    <input
                      defaultValue="Mathematics"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <Button className="gap-1.5 rounded-lg">
                  <Save className="w-4 h-4" /> {t("settings.saveChanges")}
                </Button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("settings.notifPrefs")}
                </h3>
                {notifications.map((item, i) => (
                  <label
                    key={i}
                    className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={i < 3}
                      className="mt-1 rounded border-input accent-primary"
                    />
                  </label>
                ))}
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("settings.securitySettings")}
                </h3>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t("settings.currentPassword")}
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("settings.newPassword")}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      {t("settings.confirmPassword")}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button className="gap-1.5 rounded-lg">
                  <Key className="w-4 h-4" /> {t("settings.updatePassword")}
                </Button>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-8">
                {/* Theme mode */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("settings.chooseTheme")}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`p-4 rounded-lg border text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                          theme === opt.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <opt.icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme color */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Theme Color
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setThemeColor(opt.value)}
                        className={`p-4 rounded-lg border text-sm font-medium transition-colors flex items-center gap-3 ${
                          themeColor === opt.value
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full ${opt.swatch} shrink-0`}
                        />
                        {opt.label}
                        {themeColor === opt.value && (
                          <Check className="w-3.5 h-3.5 ml-auto text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout density */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Layout Density
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {densityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDensity(opt.value)}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          density === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${density === opt.value ? "text-primary" : "text-foreground"}`}
                        >
                          {opt.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sidebar mode */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Sidebar Mode
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {sidebarOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSidebarMode(opt.value)}
                        className={`p-4 rounded-lg border text-sm font-medium transition-colors flex flex-col items-center gap-2 ${
                          sidebarMode === opt.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <opt.icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "language" && (
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("settings.langRegion")}
                </h3>
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    {t("settings.language")}
                  </label>
                  <div className="space-y-2">
                    {languageOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLanguage(opt.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                          language === opt.value
                            ? "bg-primary/10 text-primary font-medium border border-primary/20"
                            : "text-muted-foreground hover:bg-secondary border border-transparent"
                        }`}
                      >
                        <span className="text-lg">{opt.flag}</span>
                        <span>{opt.label}</span>
                        {language === opt.value && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {t("settings.timezone")}
                  </label>
                  <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option>Asia/Ho_Chi_Minh (UTC+7)</option>
                    <option>Asia/Tokyo (UTC+9)</option>
                    <option>America/New_York (UTC-5)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
