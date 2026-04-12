import { enMessages, viMessages } from "@/locales/bundle";

import {
  interpolate,
  isLanguageCode,
  isPlainVarsObject,
  type ExtractParamNames,
  type ParamsObject,
} from "./params";
import { getStoredLanguage, type LanguageCode } from "./storage";

export type { AppTimezone, LanguageCode, LanguageSettingsState } from "./storage";
export {
  getStoredLanguage,
  getStoredTimezone,
  notifyLanguageChanged,
  syncLanguageSettingsStorage,
} from "./storage";
export { useLanguage } from "@/hooks/useLanguage";
export { useTimezone } from "@/hooks/useTimezone";

export type { ExtractParamNames, ParamsObject } from "./params";

export type I18nKey = keyof typeof enMessages;

type Messages = typeof enMessages;

type ArgsFor<K extends I18nKey> = ExtractParamNames<Messages[K]> extends never
  ? [lang?: LanguageCode]
  : [vars: ParamsObject<Messages[K]>, lang?: LanguageCode];

const dict = {
  en: enMessages,
  vi: viMessages,
} satisfies Record<LanguageCode, Record<I18nKey, string>>;

export function t<K extends I18nKey>(key: K, ...rest: ArgsFor<K>): string {
  let lang: LanguageCode;
  let vars: Record<string, string | number> | undefined;

  if (rest.length === 0) {
    lang = getStoredLanguage();
    vars = undefined;
  } else {
    const [a0, a1] = rest;
    if (isPlainVarsObject(a0)) {
      vars = a0;
      lang = (a1 !== undefined && isLanguageCode(a1) ? a1 : getStoredLanguage()) as LanguageCode;
    } else if (isLanguageCode(a0)) {
      lang = a0;
      vars = undefined;
    } else {
      lang = getStoredLanguage();
      vars = undefined;
    }
  }

  const template = dict[lang][key] ?? dict.en[key] ?? key;
  const str = typeof template === "string" ? template : String(template);
  return vars ? interpolate(str, vars) : str;
}
