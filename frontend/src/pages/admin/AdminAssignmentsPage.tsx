import { Card } from "@/components/ui/card";
import { t, useLanguage } from "@/i18n";

export function AdminAssignmentsPage() {
  const lang = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("assignmentList.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("assignmentList.subtitle", lang)}</p>
      </div>
      <Card className=" p-6">
        <div className="py-12 text-center">
          <div className="text-sm text-muted-foreground">
            {t("adminAssignments.info", lang)}
          </div>
        </div>
      </Card>
    </div>
  );
}

