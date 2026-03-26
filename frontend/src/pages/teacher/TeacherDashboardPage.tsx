import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getClass, listMyClasses, type ClassDetail, type ClassResponse } from "@/services/classes.service";
import { listExams, type ExamResponse } from "@/services/exams.service";
import {
  getAssignmentReport,
  listAssignments,
  type AssignmentReportResponse,
  type AssignmentDetail,
} from "@/services/assignments.service";
import { StatCard } from "@/components/layouts/StatCard";
import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

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

export function TeacherDashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
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
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
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
      .finally(() => {
        setLoading(false);
        setBaseLoaded(true);
      });
  }, [token]);

  // Run a single sequential worker to avoid cancelling earlier batches.
  useEffect(() => {
    if (!token) return;
    if (!baseLoaded) return;

    const runId = ++runIdRef.current;
    const anyWindow = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const idle = () =>
      new Promise<void>((resolve) => {
        if (anyWindow.requestIdleCallback) {
          anyWindow.requestIdleCallback(() => resolve(), { timeout: 400 });
        } else {
          window.setTimeout(() => resolve(), 120);
        }
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
      // invalidate this run
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.full_name || "Teacher"}. Here’s your overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Icons.Users className="text-primary" />}
          value={String(stats.myStudents)}
          title="My Students"
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.BookOpen className="text-violet-700" />}
          value={String(stats.myExams)}
          title="My Exams"
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.CheckCircle className="text-info" />}
          value={String(stats.submissions)}
          title="Submissions"
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.Chart className="text-success" />}
          value={String(stats.avgScore)}
          title="Avg Score"
          change="--"
          trend="up"
        />
      </div>

      {statsLoading && (
        <div className="text-xs text-muted-foreground mt-1">
          Calculating stats… {statsProgress.classesDone}/{statsProgress.classesTotal} classes,{" "}
          {statsProgress.reportsDone}/{statsProgress.reportsTotal} assignments
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Recent Exams</h2>
            <p className="text-xs text-muted-foreground mt-1">Quick access to your latest work.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate("/teacher/exams")}>
            View all →
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="py-8">
              <div className="h-10 bg-muted rounded-xl animate-pulse mb-3" />
              <div className="h-10 bg-muted rounded-xl animate-pulse mb-3" />
              <div className="h-10 bg-muted rounded-xl animate-pulse" />
            </div>
          ) : exams.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No exams yet. Create your first exam to get started.
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {exams.slice(0, 3).map((e) => (
                <Button
                  key={e.id}
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/teacher/exams/${e.id}`)}
                  className="h-auto w-full flex-col items-stretch rounded-xl border-muted bg-white px-4 py-3 text-left font-normal hover:bg-muted"
                >
                  <div className="text-sm font-medium text-foreground">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.is_draft ? "Draft" : "Published"}</div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Quick Links</h2>
            <p className="text-xs text-muted-foreground mt-1">Common teacher actions.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/teacher/exams/new")}>Create Exam</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/teacher/assignments/new")}>New Assignment</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/teacher/classes/new")}>New Class</Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-muted px-4 py-3">
            <div className="text-xs text-muted-foreground">Classes</div>
            <div className="text-lg font-semibold text-foreground">{classes.length}</div>
          </div>
            <div className="rounded-xl border border-muted px-4 py-3">
            <div className="text-xs text-muted-foreground">Assignments</div>
            <div className="text-lg font-semibold text-foreground">{assignments.length}</div>
          </div>
          <div className="rounded-xl border border-muted px-4 py-3">
            <div className="text-xs text-muted-foreground">Students</div>
            <div className="text-lg font-semibold text-foreground">—</div>
          </div>
        </div>
      </div>
    </div>
  );
}

