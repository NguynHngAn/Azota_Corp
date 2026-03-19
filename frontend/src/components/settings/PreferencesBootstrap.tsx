import { useEffect } from "react";

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

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function applyLanguage(l: LanguageState) {
  const root = document.documentElement;
  root.dataset.lang = l.language;
  root.lang = l.language;
  root.dataset.timezone = l.timezone;
}

function applyAppearance(a: AppearanceState) {
  const root = document.documentElement;
  root.dataset.density = a.density;
  root.dataset.sidebar = a.sidebarMode;

  // Theme
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const useDark = a.theme === "dark" || (a.theme === "system" && prefersDark);
  root.classList.toggle("dark", useDark);

  // Primary color (CSS variables defined in style.css)
  root.dataset.themeColor = a.color;
}

function loadAndApply() {
  const stored = safeParse<AppearanceState>(localStorage.getItem("settings.appearance"));
  const a: AppearanceState = stored ?? { theme: "system", color: "blue", density: "comfortable", sidebarMode: "expanded" };
  applyAppearance(a);

  const storedLang = safeParse<LanguageState>(localStorage.getItem("settings.language"));
  const l: LanguageState = storedLang ?? { language: "en", timezone: "Asia/Ho_Chi_Minh" };
  applyLanguage(l);
}

export function PreferencesBootstrap() {
  useEffect(() => {
    loadAndApply();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "settings.appearance" || e.key === "settings.language") loadAndApply();
    };
    window.addEventListener("storage", onStorage);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMq = () => loadAndApply();
    mq?.addEventListener?.("change", onMq);

    return () => {
      window.removeEventListener("storage", onStorage);
      mq?.removeEventListener?.("change", onMq);
    };
  }, []);

  return null;
}

