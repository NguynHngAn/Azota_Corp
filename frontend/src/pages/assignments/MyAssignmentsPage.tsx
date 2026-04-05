import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listMyAssignments, type AssignmentDetail } from "@/services/assignments.service";
import { formatDateTimeVietnam } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/i18n";
import { Icons } from "@/components/layouts/Icons";

function getStatus(a: AssignmentDetail): { label: string; variant: "default" | "secondary" | "outline" } {
  const now = new Date();
  const start = new Date(a.start_time);
  const end = new Date(a.end_time);
  if (now < start) return { label: "upcoming", variant: "outline" };
  if (now <= end) return { label: "open", variant: "default" };
  return { label: "closed", variant: "secondary" };
}

export function MyAssignmentsPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listMyAssignments(token)
      .then(setAssignments)
      .catch((e) => setError(e instanceof Error ? e.message : t("myAssignments.failed", lang)))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("myAssignments.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("myAssignments.subtitle", lang)}</p>
        </div>
      </div>
      {assignments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          {t("myAssignments.empty", lang)}
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => {
            const status = getStatus(a);
            return (
              <div key={a.id} className="glass-card p-6 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors rounded-2xl">
                <div className="min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-foreground">{a.exam_title}</span>
                    <Badge variant={status.variant}>
                      {status.label === "upcoming"
                        ? t("myAssignments.upcoming", lang)
                        : status.label === "open"
                          ? t("myAssignments.open", lang)
                          : t("myAssignments.closed", lang)}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <Icons.Backpack className="size-3" /> {a.class_name}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Icons.Calendar className="size-3" />
                    {formatDateTimeVietnam(a.start_time)} – {formatDateTimeVietnam(a.end_time)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Icons.Clock className="size-3" />
                    {a.duration_minutes} {t("common.minutes", lang)}
                  </div>
                </div>
                {status.label === "open" && (
                  <Button asChild>
                    <Link to={`/student/assignments/${a.id}/exam`}>
                      {t("myAssignments.enterExam", lang)}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
