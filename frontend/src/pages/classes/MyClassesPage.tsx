import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listMyClasses, type ClassResponse } from "@/services/classes.service";
import { JoinClassPanel } from "@/components/features/student/join-class-panel";
import { t, useLanguage } from "@/i18n";
import { Icons } from "@/components/layouts/Icons";

export function MyClassesPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listMyClasses(token)
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : t("myClasses.failed", lang)))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("myClasses.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("myClasses.subtitle", lang)}</p>
      </div>

      <JoinClassPanel />

      {classes.length === 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm">
          <div className="py-14 text-center">
            <div className="text-sm font-medium text-foreground">{t("myClasses.empty", lang)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {t("myClasses.emptyHint", lang)}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div key={c.id} className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-4">
              <Link to={`/student/classes/${c.id}`} className="block text-foreground hover:text-primary">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icons.Backpack className="size-4" /> {c.name}
                </h3>
                {c.description ? (
                  <p className="mt-1 text-base text-muted-foreground line-clamp-2 flex items-center gap-2"><Icons.BookOpen className="size-3" /> {c.description}</p>
                ) : (
                  <p className="mt-1 text-base text-muted-foreground flex items-center gap-2"><Icons.BookOpen className="size-3" /> {t("myClasses.noDescription", lang)}</p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
