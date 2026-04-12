import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/Icons";
import { listExams, restoreExam, type ExamResponse } from "@/services/exams.service";
import { listAssignments, restoreAssignment, type AssignmentDetail } from "@/services/assignments.service";
import { formatDateTime } from "@/utils/date";
import { t, useLanguage, useTimezone } from "@/i18n";

type TrashTab = "exams" | "assignments";

export function TeacherTrashPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const tz = useTimezone();
  const [tab, setTab] = useState<TrashTab>("exams");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);

  const [selectedExamIds, setSelectedExamIds] = useState<Record<number, boolean>>({});
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<Record<number, boolean>>({});
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    Promise.all([
      listExams(token, { include_deleted: true }).catch(() => [] as ExamResponse[]),
      listAssignments(token, { include_deleted: true }).catch(() => [] as AssignmentDetail[]),
    ])
      .then(([e, a]) => {
        const examRows = Array.isArray(e) ? e : [];
        const assignmentRows = Array.isArray(a) ? a : [];
        setExams(examRows.filter((x) => Boolean(x.deleted_at)));
        setAssignments(assignmentRows.filter((x) => Boolean(x.deleted_at)));
        setSelectedExamIds({});
        setSelectedAssignmentIds({});
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("common.loading", lang)))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredExams = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return exams;
    return exams.filter((e) => e.title.toLowerCase().includes(query));
  }, [exams, q]);

  const filteredAssignments = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return assignments;
    return assignments.filter((a) => `${a.exam_title} ${a.class_name}`.toLowerCase().includes(query));
  }, [assignments, q]);

  const selectedExamList = useMemo(
    () => filteredExams.filter((e) => selectedExamIds[e.id]),
    [filteredExams, selectedExamIds],
  );
  const selectedAssignmentList = useMemo(
    () => filteredAssignments.filter((a) => selectedAssignmentIds[a.id]),
    [filteredAssignments, selectedAssignmentIds],
  );

  async function restoreSelected() {
    if (!token) return;
    setWorking(true);
    setError("");
    try {
      if (tab === "exams") {
        for (const e of selectedExamList) {
          await restoreExam(e.id, token);
        }
        setExams((prev) => prev.filter((e) => !selectedExamIds[e.id]));
        setSelectedExamIds({});
      } else {
        for (const a of selectedAssignmentList) {
          await restoreAssignment(a.id, token);
        }
        setAssignments((prev) => prev.filter((a) => !selectedAssignmentIds[a.id]));
        setSelectedAssignmentIds({});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.restoreFailed", lang));
    } finally {
      setWorking(false);
    }
  }

  const bulkCount = tab === "exams" ? selectedExamList.length : selectedAssignmentList.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("teacherTrash.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("teacherTrash.subtitle", lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={tab === "exams" ? "secondary" : "outline"}
            onClick={() => setTab("exams")}
          >
            <Icons.FileText className="size-4" /> {t("teacherTrash.exams", lang)}
          </Button>
          <Button
            type="button"
            variant={tab === "assignments" ? "secondary" : "outline"}
            onClick={() => setTab("assignments")}
          >
            <Icons.ClipboardList className="size-4" /> {t("teacherTrash.assignments", lang)}
          </Button>
        </div>
      </div>

      <Card className="p-4 glass-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="search-input max-w-md">
              <Icons.Search className="size-4" />
              <input
                type="text"
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
                placeholder={t("common.search", lang)}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Badge variant="outline">{tab === "exams" ? filteredExams.length : filteredAssignments.length} items</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={bulkCount === 0 || working}
              onClick={() => void restoreSelected()}
            >
              <Icons.Check className="size-4" />
              {working
                ? t("common.restoring", lang)
                : t("common.restoreSelected", { count: bulkCount }, lang)}
            </Button>
          </div>
        </div>
        {error ? <div className="mt-3 text-sm text-destructive">{error}</div> : null}
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">{t("common.loading", lang)}</div>
      ) : tab === "exams" ? (
        <div className="space-y-2">
          {filteredExams.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">{t("teacherTrash.empty", lang)}</div>
          ) : (
            filteredExams.map((e) => (
              <div key={e.id} className="glass-card p-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedExamIds[e.id])}
                    onChange={(ev) => setSelectedExamIds((prev) => ({ ...prev, [e.id]: ev.target.checked }))}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{e.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t("teacherTrash.deletedAt", lang)}: {e.deleted_at ? formatDateTime(e.deleted_at, lang, tz) : "—"}
                    </div>
                  </div>
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={working}
                  onClick={async () => {
                    if (!token) return;
                    setWorking(true);
                    try {
                      await restoreExam(e.id, token);
                      setExams((prev) => prev.filter((x) => x.id !== e.id));
                      setSelectedExamIds((prev) => {
                        const next = { ...prev };
                        delete next[e.id];
                        return next;
                      });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t("common.restoreFailed", lang));
                    } finally {
                      setWorking(false);
                    }
                  }}
                >
                  {t("common.restore", lang)}
                </Button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssignments.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">{t("teacherTrash.noAssignments", lang)}</div>
          ) : (
            filteredAssignments.map((a) => (
              <div key={a.id} className="glass-card p-4 flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedAssignmentIds[a.id])}
                    onChange={(ev) =>
                      setSelectedAssignmentIds((prev) => ({ ...prev, [a.id]: ev.target.checked }))
                    }
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{a.exam_title}</div>
                    <div className="mt-1 text-xs text-muted-foreground truncate">
                      {a.class_name} · {formatDateTime(a.start_time, lang, tz)} – {formatDateTime(a.end_time, lang, tz)} ·{" "}
                      {a.duration_minutes} min
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Deleted at: {a.deleted_at ? formatDateTime(a.deleted_at, lang, tz) : "—"}
                    </div>
                  </div>
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={working}
                  onClick={async () => {
                    if (!token) return;
                    setWorking(true);
                    try {
                      await restoreAssignment(a.id, token);
                      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
                      setSelectedAssignmentIds((prev) => {
                        const next = { ...prev };
                        delete next[a.id];
                        return next;
                      });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t("common.restoreFailed", lang));
                    } finally {
                      setWorking(false);
                    }
                    }}
                >
                  {t("common.restore", lang)}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

