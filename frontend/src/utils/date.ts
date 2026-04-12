import type { AppTimezone, LanguageCode } from "@/i18n/storage";

const localeForLang: Record<LanguageCode, string> = {
  en: "en-US",
  vi: "vi-VN",
};

/** Formats an ISO timestamp using UI language + user-selected timezone (Settings). */
export function formatDateTime(iso: string, lang: LanguageCode, timeZone: AppTimezone): string {
  const d = new Date(iso);
  return d.toLocaleString(localeForLang[lang], {
    timeZone,
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Calendar date only, using UI language + user-selected timezone. */
export function formatLocaleDate(iso: string, lang: LanguageCode, timeZone: AppTimezone): string {
  const d = new Date(iso);
  return d.toLocaleDateString(localeForLang[lang], {
    timeZone,
    dateStyle: "medium",
  });
}
