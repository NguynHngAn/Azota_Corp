import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Icons } from "@/components/layouts/Icons";
import { useAuth } from "@/context/AuthContext";
import {
  getAssignmentReport,
  postAssignmentReportAiInsight,
  type AssignmentInsightResponse,
  type AssignmentReportResponse,
} from "@/services/assignments.service";
import { ScoreBarChart } from "@/components/layouts/ScoreBarChart";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/i18n";

export function AssignmentReportPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const lang = useLanguage();
  const [report, setReport] = useState<AssignmentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insight, setInsight] = useState<AssignmentInsightResponse | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

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
  }, [token, id, lang]);

  if (loading) return <p className="text-muted-foreground">{t("assignmentReport.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!report) return null;

  const assignmentId = parseInt(id ?? "", 10);
  const canRequestInsight = report.submitted_count >= 1;

  async function requestAiInsight() {
    if (!token || Number.isNaN(assignmentId)) return;
    setInsightError("");
    setInsightLoading(true);
    try {
      const res = await postAssignmentReportAiInsight(assignmentId, token);
      setInsight(res);
    } catch (e) {
      setInsight(null);
      setInsightError(e instanceof Error ? e.message : t("assignmentReport.aiFailed", lang));
    } finally {
      setInsightLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{report.exam_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("assignmentReport.class", lang)}: {report.class_name}
          </p>
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

      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t("assignmentReport.aiTitle", lang)}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("assignmentReport.aiHint", lang)}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-2"
            disabled={!canRequestInsight || insightLoading || !token}
            onClick={requestAiInsight}
          >
            <Icons.Sparkles className="h-4 w-4" />
            {insightLoading ? t("assignmentReport.aiGenerating", lang) : t("assignmentReport.aiGenerate", lang)}
          </Button>
        </div>

        {!canRequestInsight ? (
          <p className="mt-3 text-sm text-muted-foreground">{t("assignmentReport.aiNeedSubmission", lang)}</p>
        ) : null}
        {insightError ? <p className="mt-3 text-sm text-destructive">{insightError}</p> : null}

        {insight ? (
          <div className="mt-4 space-y-4 rounded-xl border border-border bg-card/50 p-4 text-sm text-foreground">
            <p className="leading-relaxed">{insight.summary}</p>

            {insight.strengths.length > 0 ? (
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{t("assignmentReport.strengths", lang)}</div>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {insight.strengths.map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {insight.concerns.length > 0 ? (
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{t("assignmentReport.concerns", lang)}</div>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {insight.concerns.map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {insight.suggestions.length > 0 ? (
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{t("assignmentReport.suggestions", lang)}</div>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  {insight.suggestions.map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">Model: {insight.model}</p>
          </div>
        ) : null}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t("assignmentReport.mostMissedQuestions", lang)}</h3>
        {report.top_missed_questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("assignmentReport.noSubmissionData", lang)}</p>
        ) : (
          <div className="space-y-3">
            {report.top_missed_questions.map((item, index) => (
              <div key={item.question_id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-foreground">
                    {index + 1}. {item.question_text}
                  </div>
                  <div className="text-sm font-semibold text-destructive">{item.incorrect_rate.toFixed(2)}%</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {t("assignmentReport.incorrect", lang)}: {item.incorrect_count} | {t("assignmentReport.correct", lang)}: {item.correct_count} | {t("assignmentReport.totalAnswers", lang)}: {item.total_answers}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
