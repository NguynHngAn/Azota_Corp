import { useEffect, useMemo, useRef, useState } from "react";
import { listMyClasses, getClass, type ClassDetail, type ClassResponse } from "../../api/classes";
import { listExams, type ExamResponse } from "../../api/exams";
import { getAssignmentReport, listAssignments, type AssignmentDetail, type AssignmentReportResponse } from "../../api/assignments";
import { useAuth } from "../../context/AuthContext";
import { StatsCard } from "../../components/admin/StatsCard";
import { Icons } from "../../components/admin/icons";
import { Card } from "../../components/ui/card";

// In-memory caches (persist across SPA navigation)
const classCache = new Map<number, ClassDetail>();
const classInflight = new Map<number, Promise<ClassDetail>>();
const reportCache = new Map<number, AssignmentReportResponse>();
const reportInflight = new Map<number, Promise<AssignmentReportResponse>>();

async function getClassCached(id: number, token: string): Promise<ClassDetail> {
  const hit = classCache.get(id);
  if (hit) return hit;
  const inflight = classInflight.get(id);
  if (inflight) return inflight;
  const p = getClass(id, token)
    .then((res) => {
      classCache.set(id, res);
      return res;
    })
    .finally(() => {
      classInflight.delete(id);
    });
  classInflight.set(id, p);
  return p;
}

async function getAssignmentReportCached(id: number, token: string): Promise<AssignmentReportResponse> {
  const hit = reportCache.get(id);
  if (hit) return hit;
  const inflight = reportInflight.get(id);
  if (inflight) return inflight;
  const p = getAssignmentReport(id, token)
    .then((res) => {
      reportCache.set(id, res);
      return res;
    })
    .finally(() => {
      reportInflight.delete(id);
    });
  reportInflight.set(id, p);
  return p;
}

export function TeacherAnalyticsPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [submissionsCount, setSubmissionsCount] = useState<number | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [statsProgress, setStatsProgress] = useState<{
    classesDone: number;
    classesTotal: number;
    reportsDone: number;
    reportsTotal: number;
  }>({ classesDone: 0, classesTotal: 0, reportsDone: 0, reportsTotal: 0 });
  const [error, setError] = useState("");
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    setBaseLoaded(false);
    Promise.all([
      listMyClasses(token).catch(() => [] as ClassResponse[]),
      listExams(token).catch(() => [] as ExamResponse[]),
      listAssignments(token).catch(() => [] as AssignmentDetail[]),
    ])
      .then(([c, e, a]) => {
        setClasses(c);
        setExams(e);
        setAssignments(a);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      })
      .finally(() => {
        setLoading(false);
        setBaseLoaded(true);
      });
  }, [token]);

  // Reuse existing endpoints to compute "analytics" numbers.
  useEffect(() => {
    if (!token) return;
    if (!baseLoaded) return;

    const runId = ++runIdRef.current;
    const anyWindow = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const idle = () =>
      new Promise<void>((resolve) => {
        if (anyWindow.requestIdleCallback) anyWindow.requestIdleCallback(() => resolve(), { timeout: 400 });
        else window.setTimeout(() => resolve(), 120);
      });

    setStatsLoading(true);
    setStudentsCount(0);
    setSubmissionsCount(0);
    setAvgScore(null);
    setStatsProgress({
      classesDone: 0,
      classesTotal: classes.length,
      reportsDone: 0,
      reportsTotal: assignments.length,
    });

    const batchSizeClasses = 4;
    const batchSizeReports = 3;
    const classIds = classes.map((c) => c.id);
    const assignmentIds = assignments.map((a) => a.id);
    const maxBatches = Math.max(
      Math.ceil(classIds.length / batchSizeClasses),
      Math.ceil(assignmentIds.length / batchSizeReports),
    );

    (async () => {
      for (let i = 0; i < maxBatches; i++) {
        if (runIdRef.current !== runId) return;

        const classBatch = classIds.slice(i * batchSizeClasses, i * batchSizeClasses + batchSizeClasses);
        const reportBatch = assignmentIds.slice(i * batchSizeReports, i * batchSizeReports + batchSizeReports);

        if (classBatch.length > 0) {
          const results = await Promise.all(classBatch.map((id) => getClassCached(id, token).catch(() => null)));
          if (runIdRef.current !== runId) return;
          const addStudents = results
            .filter((c): c is ClassDetail => !!c)
            .reduce((sum, c) => sum + (c.member_count ?? 0), 0);
          setStudentsCount((prev) => (prev ?? 0) + addStudents);
          setStatsProgress((p) => ({
            ...p,
            classesDone: Math.min(p.classesDone + classBatch.length, p.classesTotal),
          }));
        }

        if (reportBatch.length > 0) {
          const reports = await Promise.all(reportBatch.map((id) => getAssignmentReportCached(id, token).catch(() => null)));
          if (runIdRef.current !== runId) return;
          const submittedTotal = reports
            .filter((r): r is AssignmentReportResponse => !!r)
            .reduce((sum, r) => sum + (r.submitted_count ?? 0), 0);
          setSubmissionsCount((prev) => (prev ?? 0) + submittedTotal);

          const fetched = Array.from(reportCache.values());
          const allValid = fetched
            .filter((r) => typeof r.average_score === "number")
            .map((r) => ({ avg: r.average_score as number, weight: r.submitted_count ?? 0 }));
          if (allValid.length > 0) {
            const weightSum = allValid.reduce((s, x) => s + x.weight, 0);
            if (weightSum > 0) {
              const weighted = allValid.reduce((s, x) => s + x.avg * x.weight, 0) / weightSum;
              setAvgScore(Math.round(weighted * 100) / 100);
            } else {
              const simple = allValid.reduce((s, x) => s + x.avg, 0) / allValid.length;
              setAvgScore(Math.round(simple * 100) / 100);
            }
          }

          setStatsProgress((p) => ({
            ...p,
            reportsDone: Math.min(p.reportsDone + reportBatch.length, p.reportsTotal),
          }));
        }

        await idle();
      }

      if (runIdRef.current === runId) setStatsLoading(false);
    })();

    return () => {
      runIdRef.current++;
    };
  }, [assignments, baseLoaded, classes, token]);

  const stats = useMemo(() => {
    return {
      myStudents: statsLoading ? studentsCount ?? "—" : studentsCount ?? 0,
      myExams: exams.length,
      submissions: statsLoading ? submissionsCount ?? "—" : submissionsCount ?? 0,
      avgScore: statsLoading ? avgScore ?? "—" : avgScore ?? "—",
    };
  }, [avgScore, exams.length, statsLoading, studentsCount, submissionsCount]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500">Performance overview and insights.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={<Icons.Users />} value={stats.myStudents} label="My Students" tone="blue" />
        <StatsCard icon={<Icons.Book />} value={stats.myExams} label="Exams" tone="violet" />
        <StatsCard icon={<Icons.Clipboard />} value={stats.submissions} label="Submissions" tone="slate" />
        <StatsCard icon={<Icons.Chart />} value={stats.avgScore} label="Avg Score" tone="green" />
      </div>

      <Card className="border border-slate-100 shadow-sm">
        {error ? (
          <div className="text-sm text-rose-600">{error}</div>
        ) : loading ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded bg-slate-50 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-slate-50 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-2">
            {statsLoading && (
              <div className="text-xs text-slate-400">
                Calculating stats… {statsProgress.classesDone}/{statsProgress.classesTotal} classes,{" "}
                {statsProgress.reportsDone}/{statsProgress.reportsTotal} assignments
              </div>
            )}
            <div className="text-sm text-slate-600">
              This tab currently uses existing endpoints (classes + assignments reports). A dedicated analytics backend
              can be added later for charts, trends, and time-series.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

