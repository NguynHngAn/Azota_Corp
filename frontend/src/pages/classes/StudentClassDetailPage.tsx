import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getClass, leaveClass, type ClassDetail } from "@/services/classes.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t, useLanguage } from "@/i18n";
import { Icons } from "@/components/layouts/Icons";

export function StudentClassDetailPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);

  const classId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    getClass(classId, token)
      .then(setCls)
      .catch((e) => setError(e instanceof Error ? e.message : t("studentClass.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, id, classId, lang]);

  async function handleLeave() {
    if (!token || !window.confirm(t("studentClass.leaveConfirm", lang))) return;
    setLeaving(true);
    try {
      await leaveClass(classId, token);
      navigate("/student/classes");
    } catch {
      // ignore
    } finally {
      setLeaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error || !cls) return <p className="text-destructive">{error || t("studentClass.notFound", lang)}</p>;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Link to="/student/classes" className="text-primary hover:underline flex items-center gap-2">
          <Icons.ArrowLeft className="size-4" /> {t("studentClass.back", lang)}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icons.Backpack className="size-4" /> {cls.name}
        </h2>
        {cls.is_archived ? <Badge variant="secondary">{t("studentClass.archived", lang)}</Badge> : null}
      </div>
      {cls.description && <p className="text-muted-foreground mt-1">{cls.description}</p>}
      <p className="text-sm text-muted-foreground mt-2">
        {t("studentClass.teacher", lang)}: {cls.creator?.full_name ?? "—"}
      </p>
      <Button type="button" variant="outline" className="mt-4" disabled={leaving} onClick={() => void handleLeave()}>
        {leaving ? t("common.loading", lang) : t("studentClass.leave", lang)}
      </Button>
    </div>
  );
}
