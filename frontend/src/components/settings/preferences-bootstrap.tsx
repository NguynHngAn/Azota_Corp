import { useEffect } from "react";

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

function loadAndApply() {
  const storedLang = safeParse<LanguageState>(localStorage.getItem("settings.language"));
  const l: LanguageState = storedLang ?? { language: "en", timezone: "Asia/Ho_Chi_Minh" };
  applyLanguage(l);
}

export function PreferencesBootstrap() {
  useEffect(() => {
    loadAndApply();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "settings.language") loadAndApply();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}

