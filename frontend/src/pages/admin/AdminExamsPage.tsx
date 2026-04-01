import { Card } from "@/components/ui/card";
import { t, useLanguage } from "@/i18n";

export function AdminExamsPage() {
  const lang = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("examList.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("examList.subtitle", lang)}</p>
      </div>
      <Card className=" p-6">
        <div className="py-12 text-center">
          <div className="text-sm text-muted-foreground">
            {t("adminExams.info", lang)}
          </div>
        </div>
      </Card>
    </div>
  );
}

