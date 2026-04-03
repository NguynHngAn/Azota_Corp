import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getSubmissionResult, type SubmissionResultResponse } from "@/services/assignments.service";
import { formatDateTimeVietnam } from "@/utils/date";
import { useExam } from "@/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/i18n";

export function SubmissionResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { finishExam } = useExam();
  const lang = useLanguage();
  const [data, setData] = useState<SubmissionResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !submissionId) return;
    const id = parseInt(submissionId, 10);
    if (Number.isNaN(id)) {
      setError(t("submissionResult.invalid", lang));
      setLoading(false);
      return;
    }
    getSubmissionResult(id, token)
      .then((res) => {
        setData(res);
        finishExam();
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("submissionResult.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, submissionId, finishExam]);

  if (loading) return <p className="text-muted-foreground">{t("submissionResult.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) return null;

  const correctCount = data.question_results.filter((r) => r.correct).length;
  const wrongCount = data.question_results.length - correctCount;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{data.exam_title}</h2>
        <p className="text-sm text-muted-foreground">
          {t("submissionResult.submittedAt", lang)} {data.submitted_at ? formatDateTimeVietnam(data.submitted_at) : "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("studentResults.score", lang)}</div>
          <div className="text-2xl font-bold text-primary">{data.score ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("submissionResult.outOf100", lang)}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("studentResults.correct", lang)}</div>
          <div className="text-2xl font-bold text-success">{correctCount}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("submissionResult.questions", lang)}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("studentResults.wrong", lang)}</div>
          <div className="text-2xl font-bold text-destructive">{wrongCount}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("submissionResult.questions", lang)}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs uppercase text-muted-foreground mb-1">{t("studentResults.total", lang)}</div>
          <div className="text-2xl font-bold text-foreground">{data.question_details.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("submissionResult.questions", lang)}</div>
        </div>
      </div>

      <div className="space-y-4">
        {data.question_details.map((q, idx) => {
          const chosenTexts = q.options.filter((o) => q.chosen_option_ids.includes(o.id)).map((o) => o.text);
          const correctTexts = q.options.filter((o) => o.is_correct).map((o) => o.text);
          return (
            <div className="glass-card p-6" key={q.question_id}>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="font-medium text-foreground">
                  {t("submissionResult.question", lang).replace("{{number}}", String(idx + 1))}: {q.question_text}
                </span>
                <Badge variant={q.correct ? "default" : "destructive"}>
                  {q.correct ? t("studentResults.correct", lang) : t("studentResults.wrong", lang)}
                </Badge>
              </div>
              <div className="text-sm space-y-1 mt-2">
                <div>
                  <span className="text-muted-foreground">{t("submissionResult.yourAnswer", lang)}: </span>
                  {chosenTexts.length ? chosenTexts.join(", ") : "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("submissionResult.correctAnswer", lang)}: </span>
                  {correctTexts.length ? correctTexts.join(", ") : "—"}
                </div>
                {q.ai_explanation && (
                  <div className="pt-2 border-t border-muted-foreground mt-2">
                    <span className="block text-muted-foreground mb-1">{t("submissionResult.aiExplanation", lang)}</span>
                    <p className="text-foreground text-sm whitespace-pre-line">{q.ai_explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          {t("submissionResult.back", lang)}
        </Button>
      </div>
    </div>
  );
}
