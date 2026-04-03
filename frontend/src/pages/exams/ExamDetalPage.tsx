import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";

import { useAuth } from "@/context/AuthContext";
import { getExam, type ExamDetail } from "@/services/exams.service";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

function questionTypeLabel(type: ExamDetail["questions"][number]["question_type"]): string {
  return type === "single_choice" ? "Single choice" : "Multiple choice";
}

export default function ExamDetailPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const location = useLocation();
  const { id, examId } = useParams<{ id?: string; examId?: string }>();

  const examIdRaw = id ?? examId;
  const examIdNum = examIdRaw ? Number.parseInt(examIdRaw, 10) : NaN;

  const base = useMemo(() => basePath(location.pathname), [location.pathname]);

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    if (!Number.isFinite(examIdNum)) {
      setError("Invalid exam id");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setExam(null);

    getExam(examIdNum, token)
      .then((data) => setExam(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load exam"))
      .finally(() => setLoading(false));
  }, [token, examIdNum, lang]);

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error || !exam) return <p className="text-destructive">{error || "Exam not found"}</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link to={`${base}/exams`} className="text-sm text-primary hover:underline flex items-center gap-2">
          <Icons.ArrowLeft className="size-4" /> {t("examDetail.backToExams", lang)}
        </Link>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icons.Backpack className="size-4" /> {exam.title}
            </h2>
            {exam.description ? <p className="mt-1 text-sm text-muted-foreground">{exam.description}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {exam.questions.length} questions · Created {new Date(exam.created_at).toLocaleDateString()}
            </p>
          </div>

          <Badge variant={exam.is_draft ? "outline" : "default"}>
            {exam.is_draft ? t("common.status.draft", lang) : t("common.status.published", lang)}
          </Badge>
        </div>
      </div>

      {exam.questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm glass-card">{t("examDetail.noQuestions", lang)}</div>
      ) : (
        <div className="space-y-4">
          {exam.questions.map((q, qIndex) => (
            <Card key={q.id} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Question {qIndex + 1} · {questionTypeLabel(q.question_type)}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">{q.text}</p>

              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                      opt.is_correct ? "border-primary/30 bg-primary/5" : "border-border bg-background/50"
                    }`}
                  >
                    {opt.is_correct ? (
                      <Icons.CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Icons.XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className="text-muted-foreground font-medium mr-1">{String.fromCharCode(65 + optIndex)}.</span>
                    <span className={opt.is_correct ? "text-foreground font-medium" : "text-muted-foreground"}>{opt.text}</span>
                  </div>
                ))}
                {q.options.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">{t("examDetail.noAnswerOptionsDefined", lang)}</p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
