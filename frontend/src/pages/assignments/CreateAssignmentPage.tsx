import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listExams, type ExamResponse } from "@/services/exams.service";
import { listClasses, type ClassResponse } from "@/services/classes.service";
import { createAssignment, type AssignmentCreatePayload } from "@/services/assignments.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t, useLanguage } from "@/i18n";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

function toISOString(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  return new Date(datetimeLocal).toISOString();
}

export function CreateAssignmentPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [examId, setExamId] = useState<number | "">("");
  const [classId, setClassId] = useState<number | "">("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [maxViolations, setMaxViolations] = useState<number>(3);
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([listExams(token), listClasses(token)])
      .then(([examsList, classesList]) => {
        setExams(examsList);
        setClasses(classesList);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("createAssignment.failedLoad", lang)));
  }, [token]);

  useEffect(() => {
    const selectedExam = exams.find((item) => item.id === examId);
    if (!selectedExam) return;
    setShuffleQuestions(selectedExam.shuffle_questions);
    setShuffleOptions(selectedExam.shuffle_options);
  }, [examId, exams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (examId === "" || classId === "") {
      setError(t("createAssignment.selectExamClass", lang));
      return;
    }
    const start = toISOString(startDateTime);
    const end = toISOString(endDateTime);
    if (!start || !end) {
      setError(t("createAssignment.setTime", lang));
      return;
    }
    if (new Date(start) >= new Date(end)) {
      setError(t("createAssignment.invalidRange", lang));
      return;
    }
    if (durationMinutes < 1 || durationMinutes > 600) {
      setError(t("createAssignment.invalidDuration", lang));
      return;
    }
    setSubmitting(true);
    if (!token) return;
    try {
      const body: AssignmentCreatePayload = {
        exam_id: examId as number,
        class_id: classId as number,
        start_time: start,
        end_time: end,
        duration_minutes: durationMinutes,
        shuffle_questions: shuffleQuestions,
        shuffle_options: shuffleOptions,
        max_violations: maxViolations,
        max_attempts: maxAttempts,
      };
      await createAssignment(body, token);
      navigate(`${base}/assignments`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createAssignment.failedLoad", lang));
    } finally {
      setSubmitting(false);
    }
  }

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-lg font-semibold mb-4">{t("createAssignment.title", lang)}</h2>
      <Card className="max-w-md p-6 glass-card hover:shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("createAssignment.exam", lang)}</label>
            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className={selectClass}
            >
              <option value="">{t("createAssignment.selectExam", lang)}</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} {e.is_draft ? `(${t("common.status.draft", lang)})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("createAssignment.class", lang)}</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value === "" ? "" : Number(e.target.value))}
              required
              className={selectClass}
            >
              <option value="">{t("createAssignment.selectClass", lang)}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("createAssignment.startTime", lang)}</label>
            <Input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("createAssignment.endTime", lang)}</label>
            <Input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("createAssignment.duration", lang)}</label>
            <Input
              type="number"
              min={1}
              max={600}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="text-sm font-medium text-foreground">{t("createAssignment.protections", lang)}</div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                className="accent-primary"
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
              />
              {t("createAssignment.shuffleQuestions", lang)}
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                className="accent-primary"
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
              />
              {t("createAssignment.shuffleOptions", lang)}
            </label>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("createAssignment.autoSubmitViolations", lang)}
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={maxViolations}
                onChange={(e) => setMaxViolations(Number(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t("createAssignment.maxAttempts", lang)}
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value) || 1)}
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? t("createClass.creating", lang) : t("createAssignment.assign", lang)}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`${base}/assignments`)}>
              {t("common.cancel", lang)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
