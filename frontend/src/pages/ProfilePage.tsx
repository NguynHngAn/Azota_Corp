import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t, useLanguage } from "@/i18n";

export function ProfilePage() {
  const { user } = useAuth();
  const lang = useLanguage();

  const displayName = user?.full_name || user?.email || "";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">{t("profile.account", lang)}</p>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              {t("profile.hello", { name: displayName || t("common.user", lang) }, lang)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("profile.welcome", lang)}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{user?.email}</span>
        </div>
      </header>

      <Card>
        <h2 className="text-base font-semibold text-foreground mb-1">{t("profile.infoTitle", lang)}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t("profile.infoSubtitle", lang)}
        </p>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">{t("common.email", lang)}</label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">{t("profile.displayName", lang)}</label>
            <Input value={user?.full_name ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">{t("common.role", lang)}</label>
            <Input value={user?.role ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">{t("profile.createdAt", lang)}</label>
            <Input value={user?.created_at ?? ""} disabled />
          </div>
        </div>
      </Card>
    </div>
  );
}

