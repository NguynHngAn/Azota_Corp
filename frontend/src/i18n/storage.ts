export type LanguageCode = "en" | "vi";

/** IANA zones offered in settings; extend as product adds more. */
export type AppTimezone = "Asia/Ho_Chi_Minh" | "Asia/Tokyo" | "America/New_York";

export type LanguageSettingsState = {
  language: LanguageCode;
  timezone: AppTimezone;
};

const LANGUAGE_EVENT = "app:language-changed";
const LOCALE_SETTINGS_CHANGED = "app:locale-settings-changed";

const DEFAULT_TIMEZONE: AppTimezone = "Asia/Ho_Chi_Minh";

function parseLanguageSettings(raw: string | null): LanguageSettingsState | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Partial<LanguageSettingsState>;
    const language: LanguageCode = obj.language === "vi" ? "vi" : "en";
    let timezone: AppTimezone = DEFAULT_TIMEZONE;
    if (obj.timezone === "Asia/Tokyo" || obj.timezone === "America/New_York" || obj.timezone === "Asia/Ho_Chi_Minh") {
      timezone = obj.timezone;
    }
    return { language, timezone };
  } catch {
    return null;
  }
}

export function getStoredLanguage(): LanguageCode {
  try {
    const raw = localStorage.getItem("settings.language");
    const parsed = parseLanguageSettings(raw);
    return parsed?.language ?? "en";
  } catch {
    return "en";
  }
}

export function getStoredTimezone(): AppTimezone {
  try {
    const raw = localStorage.getItem("settings.language");
    const parsed = parseLanguageSettings(raw);
    return parsed?.timezone ?? DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** Write language + timezone immediately (avoids race with `useLocalStorageState` useEffect). */
export function syncLanguageSettingsStorage(state: LanguageSettingsState): void {
  try {
    localStorage.setItem("settings.language", JSON.stringify(state));
  } catch {
    // private mode / quota
  }
}

export function notifyLanguageChanged(lang: LanguageCode) {
  if (typeof window === "undefined") return;
  const ev = new CustomEvent<LanguageCode>(LANGUAGE_EVENT, { detail: lang });
  window.dispatchEvent(ev);
  window.dispatchEvent(new CustomEvent(LOCALE_SETTINGS_CHANGED));
}

/** @internal Used by `useTimezone` hook. */
export function subscribeLocaleSettings(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === "settings.language") onChange();
  };
  const onLocale = () => onChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCALE_SETTINGS_CHANGED, onLocale);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCALE_SETTINGS_CHANGED, onLocale);
  };
}

/** @internal Used by `useLanguage` hook. */
export function subscribeLanguage(
  onChange: (lang: LanguageCode) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === "settings.language") onChange(getStoredLanguage());
  };
  const onLangEvent = (e: Event) => {
    const ce = e as CustomEvent<LanguageCode>;
    if (ce.detail) onChange(ce.detail);
    else onChange(getStoredLanguage());
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LANGUAGE_EVENT, onLangEvent);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LANGUAGE_EVENT, onLangEvent);
  };
}
