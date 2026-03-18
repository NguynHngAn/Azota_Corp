import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExam, type ExamDetail } from "@/api/exams";
import { AUTH_TOKEN_KEY } from "@/utils/constants";
import { toast } from "sonner";

const ExamDetailPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";
    const id = Number(examId);

    if (!token) {
      navigate("/landing", { replace: true });
      return;
    }
    if (!id || Number.isNaN(id)) {
      toast.error("Invalid exam id");
      navigate("/exams", { replace: true });
      return;
    }

    const fetchExam = async () => {
      try {
        setLoading(true);
        const data = await getExam(id, token);
        setExam(data);
      } catch {
        toast.error("Exam not found");
        navigate("/exams", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void fetchExam();
  }, [examId, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!exam) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/exams")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
            {exam.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {exam.description}
              </p>
            )}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              exam.is_draft
                ? "bg-muted text-muted-foreground"
                : "bg-green-500/10 text-green-600"
            }`}
          >
            {exam.is_draft ? "draft" : "active"}
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          {exam.questions.length} questions · Created{" "}
          {new Date(exam.created_at).toLocaleDateString()}
        </div>

        {exam.questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm glass-card">
            No questions in this exam yet.
          </div>
        ) : (
          <div className="space-y-4">
            {exam.questions.map((q, qi) => (
              <div key={q.id} className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Question {qi + 1} ·{" "}
                    {q.question_type === "single_choice"
                      ? "Single Choice"
                      : "Multiple Choice"}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{q.text}</p>

                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                        opt.is_correct
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-border bg-background/50"
                      }`}
                    >
                      {opt.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className="text-muted-foreground font-medium mr-1">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span
                        className={
                          opt.is_correct
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {opt.text}
                      </span>
                    </div>
                  ))}
                  {q.options.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No answer options defined.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamDetailPage;
