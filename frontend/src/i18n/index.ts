import { useEffect, useState } from "react";

export type LanguageCode = "en" | "vi";

export type I18nKey =
  | "app.brand"
  | "role.admin"
  | "role.teacher"
  | "role.student"
  | "nav.dashboard"
  | "nav.exams"
  | "nav.questionBank"
  | "nav.classes"
  | "nav.assignments"
  | "nav.students"
  | "nav.myClasses"
  | "nav.myResults"
  | "nav.settings"
  | "nav.antiCheating"
  | "common.searchPlaceholderTeacher"
  | "common.searchPlaceholderAdmin"
  | "common.searchPlaceholderStudent"
  | "common.createExam"
  | "common.signOut"
  | "settings.title"
  | "settings.subtitle"
  | "settings.tab.profile"
  | "settings.tab.notifications"
  | "settings.tab.security"
  | "settings.tab.appearance"
  | "settings.tab.language"
  | "settings.panel.profile"
  | "settings.panel.notifications"
  | "settings.panel.security"
  | "settings.panel.appearance"
  | "settings.panel.language"
  | "settings.language.title"
  | "settings.language.timezone";

const dict: Record<LanguageCode, Record<I18nKey, string>> = {
  en: {
    "app.brand": "EduFlow",
    "role.admin": "Admin",
    "role.teacher": "Teacher",
    "role.student": "Student",
    "nav.dashboard": "Dashboard",
    "nav.exams": "Exams",
    "nav.questionBank": "Question Bank",
    "nav.classes": "Classes",
    "nav.assignments": "Assignments",
    "nav.students": "Students",
    "nav.myClasses": "My Classes",
    "nav.myResults": "My Results",
    "nav.settings": "Settings",
    "nav.antiCheating": "Anti-cheating",
    "common.searchPlaceholderTeacher": "Search exams, students, classes...",
    "common.searchPlaceholderAdmin": "Search exams, students, classes...",
    "common.searchPlaceholderStudent": "Search exams, classes...",
    "common.createExam": "Create Exam",
    "common.signOut": "Sign out",
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences.",
    "settings.tab.profile": "Profile",
    "settings.tab.notifications": "Notifications",
    "settings.tab.security": "Security",
    "settings.tab.appearance": "Appearance",
    "settings.tab.language": "Language",
    "settings.panel.profile": "Profile Information",
    "settings.panel.notifications": "Notification Preferences",
    "settings.panel.security": "Security Settings",
    "settings.panel.appearance": "Choose your preferred theme",
    "settings.panel.language": "Language & Region",
    "settings.language.title": "Language",
    "settings.language.timezone": "Timezone",
  },
  vi: {
    "app.brand": "EduFlow",
    "role.admin": "Quản trị",
    "role.teacher": "Giáo viên",
    "role.student": "Học sinh",
    "nav.dashboard": "Tổng quan",
    "nav.exams": "Đề thi",
    "nav.questionBank": "Ngân hàng câu hỏi",
    "nav.classes": "Lớp học",
    "nav.assignments": "Bài tập",
    "nav.students": "Học sinh",
    "nav.myClasses": "Lớp của tôi",
    "nav.myResults": "Kết quả",
    "nav.settings": "Cài đặt",
    "nav.antiCheating": "Chống gian lận",
    "common.searchPlaceholderTeacher": "Tìm đề thi, học sinh, lớp học...",
    "common.searchPlaceholderAdmin": "Tìm đề thi, học sinh, lớp học...",
    "common.searchPlaceholderStudent": "Tìm đề thi, lớp học...",
    "common.createExam": "Tạo đề thi",
    "common.signOut": "Đăng xuất",
    "settings.title": "Cài đặt",
    "settings.subtitle": "Quản lý tài khoản và tuỳ chọn.",
    "settings.tab.profile": "Hồ sơ",
    "settings.tab.notifications": "Thông báo",
    "settings.tab.security": "Bảo mật",
    "settings.tab.appearance": "Giao diện",
    "settings.tab.language": "Ngôn ngữ",
    "settings.panel.profile": "Thông tin hồ sơ",
    "settings.panel.notifications": "Tuỳ chọn thông báo",
    "settings.panel.security": "Cài đặt bảo mật",
    "settings.panel.appearance": "Chọn giao diện ưa thích",
    "settings.panel.language": "Ngôn ngữ & Khu vực",
    "settings.language.title": "Ngôn ngữ",
    "settings.language.timezone": "Múi giờ",
  },
};

const LANGUAGE_EVENT = "app:language-changed";

export function getStoredLanguage(): LanguageCode {
  try {
    const raw = localStorage.getItem("settings.language");
    if (!raw) return "en";
    const obj = JSON.parse(raw) as { language?: LanguageCode };
    return obj.language === "vi" ? "vi" : "en";
  } catch {
    return "en";
  }
}

export function t(key: I18nKey, lang?: LanguageCode): string {
  const l = lang ?? getStoredLanguage();
  return dict[l][key] ?? dict.en[key] ?? key;
}

export function notifyLanguageChanged(lang: LanguageCode) {
  if (typeof window === "undefined") return;
  const ev = new CustomEvent<LanguageCode>(LANGUAGE_EVENT, { detail: lang });
  window.dispatchEvent(ev);
}

export function useLanguage(): LanguageCode {
  const [lang, setLang] = useState<LanguageCode>(() => getStoredLanguage());

  useEffect(() => {
    const sync = (next?: LanguageCode) => {
      if (next) setLang(next);
      else setLang(getStoredLanguage());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "settings.language") sync();
    };
    const onLangEvent = (e: Event) => {
      const ce = e as CustomEvent<LanguageCode>;
      sync(ce.detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(LANGUAGE_EVENT, onLangEvent);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LANGUAGE_EVENT, onLangEvent);
    };
  }, []);

  return lang;
}

