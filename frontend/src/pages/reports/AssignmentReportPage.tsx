import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getAssignmentReport, type AssignmentReportResponse } from "@/services/assignments.service";
import { ScoreBarChart } from "@/components/layouts/ScoreBarChart";
import { t, useLanguage } from "@/i18n";
export function AssignmentReportPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const lang = useLanguage();
  const [report, setReport] = useState<AssignmentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    const assignmentId = parseInt(id, 10);
    if (Number.isNaN(assignmentId)) {
      setError(t("assignmentReport.invalid", lang));
      setLoading(false);
      return;
    }
    getAssignmentReport(assignmentId, token)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : t("assignmentReport.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <p className="text-muted-foreground">{t("assignmentReport.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!report) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{report.exam_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("assignmentReport.class", lang)}: {report.class_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("assignmentReport.totalStudents", lang)}</div>
          <div className="text-2xl font-bold text-primary">{report.total_students}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("antiCheat.submitted", lang)}</div>
          <div className="text-2xl font-bold text-success">{report.submitted_count}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("assignmentReport.notSubmitted", lang)}</div>
          <div className="text-2xl font-bold text-warning">{report.not_submitted_count}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("assignmentReport.averageScore", lang)}</div>
          <div className="text-2xl font-bold text-foreground">
            {report.average_score != null ? report.average_score.toFixed(2) : "--"}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("assignmentReport.scoreDistribution", lang)}</h3>
        <ScoreBarChart buckets={report.score_buckets} />
      </div>
    </div>
  );
}

