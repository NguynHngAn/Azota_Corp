import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getClass, type ClassDetail } from "@/services/classes.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";
import { classBasePath } from "@/pages/classes/classRoutes";

function tr(lang: ReturnType<typeof useLanguage>, key: string, values?: Record<string, string | number>) {
  const base = t(key as never, lang);
  if (!values) return base;
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
    base,
  );
}

export function ClassDetailPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const base = classBasePath(location.pathname);
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const classId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    getClass(classId, token)
      .then(setCls)
      .catch((e) => setError(e instanceof Error ? e.message : t("classDetail.loadFailed", lang)))
      .finally(() => setLoading(false));
  }, [token, id, classId, lang]);

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error || !cls) return <p className="text-destructive">{error || t("classDetail.notFound", lang)}</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link to={`${base}/classes`} className="text-sm text-primary hover:underline flex items-center gap-2">
          <Icons.ArrowLeft className="size-4" /> {t("classDetail.backToClasses", lang)}
        </Link>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground flex flex-wrap items-center gap-2">
              <Icons.Backpack className="size-4 shrink-0" /> {cls.name}
              {cls.is_archived ? (
                <Badge variant="secondary">{t("classSettings.archivedBadge", lang)}</Badge>
              ) : null}
            </h2>
            {cls.description ? <p className="mt-1 text-sm text-muted-foreground">{cls.description}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">{tr(lang, "classDetail.membersCount", { count: cls.member_count })}</p>
            {cls.creator ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {t("studentClass.teacher", lang)}: {cls.creator.full_name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={`${base}/classes/${cls.id}/members`}>{t("classNav.members", lang)}</Link>
        </Button>
        {cls.can_manage ? (
          <Button type="button" variant="default" size="sm" asChild>
            <Link to={`${base}/classes/${cls.id}/settings`}>{t("classNav.settings", lang)}</Link>
          </Button>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">{t("classDetail.overviewHint", lang)}</p>
    </div>
  );
}
