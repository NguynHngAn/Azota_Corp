import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    "nav.dashboard": "Dashboard",
    "nav.exams": "Exams",
    "nav.questionBank": "Question Bank",
    "nav.classes": "Classes",
    "nav.myClasses": "My Classes",
    "nav.students": "Students",
    "nav.analytics": "Analytics",
    "nav.antiCheating": "Anti-cheating",
    "nav.settings": "Settings",
    "nav.myResults": "My Results",
    "nav.users": "Users",
    "nav.schools": "Schools",
    "nav.signOut": "Sign out",

    // TopNavbar
    "search.placeholder": "Search exams, students, classes...",
    "btn.createExam": "Create Exam",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences.",
    "settings.profile": "Profile",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.profileInfo": "Profile Information",
    "settings.changePhoto": "Change Photo",
    "settings.fullName": "Full Name",
    "settings.email": "Email",
    "settings.school": "School",
    "settings.subject": "Subject",
    "settings.saveChanges": "Save Changes",
    "settings.notifPrefs": "Notification Preferences",
    "settings.examSubmissions": "Exam submissions",
    "settings.examSubmissionsDesc": "Get notified when students submit exams",
    "settings.newStudent": "New student registration",
    "settings.newStudentDesc": "Alert when new students join your class",
    "settings.antiCheatAlerts": "Anti-cheating alerts",
    "settings.antiCheatAlertsDesc": "Real-time alerts for suspicious activity",
    "settings.weeklyReports": "Weekly reports",
    "settings.weeklyReportsDesc": "Summary of class performance every week",
    "settings.systemUpdates": "System updates",
    "settings.systemUpdatesDesc": "Platform news and feature updates",
    "settings.securitySettings": "Security Settings",
    "settings.currentPassword": "Current Password",
    "settings.newPassword": "New Password",
    "settings.confirmPassword": "Confirm Password",
    "settings.updatePassword": "Update Password",
    "settings.chooseTheme": "Choose your preferred theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.langRegion": "Language & Region",
    "settings.timezone": "Timezone",
  },
  vi: {
    // Sidebar
    "nav.dashboard": "Trang chủ",
    "nav.exams": "Bài thi",
    "nav.questionBank": "Ngân hàng câu hỏi",
    "nav.classes": "Lớp học",
    "nav.myClasses": "Lớp của tôi",
    "nav.students": "Học sinh",
    "nav.analytics": "Phân tích",
    "nav.antiCheating": "Chống gian lận",
    "nav.settings": "Cài đặt",
    "nav.myResults": "Kết quả",
    "nav.users": "Người dùng",
    "nav.schools": "Trường học",
    "nav.signOut": "Đăng xuất",

    // TopNavbar
    "search.placeholder": "Tìm kiếm bài thi, học sinh, lớp...",
    "btn.createExam": "Tạo bài thi",

    // Settings
    "settings.title": "Cài đặt",
    "settings.subtitle": "Quản lý tài khoản và tuỳ chọn.",
    "settings.profile": "Hồ sơ",
    "settings.notifications": "Thông báo",
    "settings.security": "Bảo mật",
    "settings.appearance": "Giao diện",
    "settings.language": "Ngôn ngữ",
    "settings.profileInfo": "Thông tin hồ sơ",
    "settings.changePhoto": "Đổi ảnh",
    "settings.fullName": "Họ và tên",
    "settings.email": "Email",
    "settings.school": "Trường",
    "settings.subject": "Môn học",
    "settings.saveChanges": "Lưu thay đổi",
    "settings.notifPrefs": "Tuỳ chọn thông báo",
    "settings.examSubmissions": "Nộp bài thi",
    "settings.examSubmissionsDesc": "Nhận thông báo khi học sinh nộp bài",
    "settings.newStudent": "Đăng ký học sinh mới",
    "settings.newStudentDesc": "Cảnh báo khi có học sinh mới tham gia lớp",
    "settings.antiCheatAlerts": "Cảnh báo gian lận",
    "settings.antiCheatAlertsDesc":
      "Cảnh báo theo thời gian thực về hành vi đáng ngờ",
    "settings.weeklyReports": "Báo cáo hàng tuần",
    "settings.weeklyReportsDesc": "Tóm tắt kết quả lớp hàng tuần",
    "settings.systemUpdates": "Cập nhật hệ thống",
    "settings.systemUpdatesDesc": "Tin tức và tính năng mới",
    "settings.securitySettings": "Cài đặt bảo mật",
    "settings.currentPassword": "Mật khẩu hiện tại",
    "settings.newPassword": "Mật khẩu mới",
    "settings.confirmPassword": "Xác nhận mật khẩu",
    "settings.updatePassword": "Cập nhật mật khẩu",
    "settings.chooseTheme": "Chọn giao diện ưa thích",
    "settings.light": "Sáng",
    "settings.dark": "Tối",
    "settings.system": "Hệ thống",
    "settings.langRegion": "Ngôn ngữ & Khu vực",
    "settings.timezone": "Múi giờ",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("eduflow-lang") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("eduflow-lang", lang);
  };

  const t = useCallback(
    (key: string): string => translations[language][key] || key,
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
