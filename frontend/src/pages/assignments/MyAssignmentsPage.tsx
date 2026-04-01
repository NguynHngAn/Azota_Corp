import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listMyAssignments, type AssignmentDetail } from "@/services/assignments.service";
import { formatDateTimeVietnam } from "@/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/i18n";

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

  if (loading) return <p className="text-gray-600">{t("common.loading", lang)}</p>;
  if (error) return <p className="text-red-600">{error}</p>;

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
              <Card key={a.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-gray-900">{a.exam_title}</span>
                    <Badge variant={status.variant}>
                      {status.label === "upcoming"
                        ? t("myAssignments.upcoming", lang)
                        : status.label === "open"
                          ? t("myAssignments.open", lang)
                          : t("myAssignments.closed", lang)}
                    </Badge>
                  </div>
                  <span className="text-gray-500 text-sm">· {a.class_name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDateTimeVietnam(a.start_time)} – {formatDateTimeVietnam(a.end_time)} ·{" "}
                    {a.duration_minutes} min
                  </div>
                </div>
                {status.label === "open" && (
                  <Button>
                    <Link to={`/student/assignments/${a.id}/exam`} className="text-white">
                      {t("myAssignments.enterExam", lang)}
                    </Link>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
