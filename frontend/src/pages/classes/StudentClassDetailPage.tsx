import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getClass, type ClassDetail } from "@/services/classes.service";
import { t, useLanguage } from "@/i18n";

export function StudentClassDetailPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const classId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    getClass(classId, token)
      .then(setCls)
      .catch((e) => setError(e instanceof Error ? e.message : t("studentClass.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, id, classId]);

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error || !cls) return <p className="text-destructive">{error || t("studentClass.notFound", lang)}</p>;

  return (
    <div>
      <div className="mb-4">
        <Link to="/student/classes" className="text-primary hover:underline">
          ← {t("studentClass.back", lang)}
        </Link>
      </div>
      <h2 className="text-lg font-semibold text-foreground">{cls.name}</h2>
      {cls.description && <p className="text-muted-foreground mt-1">{cls.description}</p>}
      <p className="text-sm text-muted-foreground mt-2">{t("studentClass.teacher", lang)}: {cls.creator?.full_name ?? "—"}</p>
    </div>
  );
}
