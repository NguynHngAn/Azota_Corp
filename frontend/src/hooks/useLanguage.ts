import { useEffect, useState } from "react";

import { getStoredLanguage, subscribeLanguage, type LanguageCode } from "@/i18n/storage";

export function useLanguage(): LanguageCode {
  const [lang, setLang] = useState<LanguageCode>(() => getStoredLanguage());

  useEffect(() => subscribeLanguage(setLang), []);

  return lang;
}
