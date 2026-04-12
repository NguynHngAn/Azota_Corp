import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listMyClasses, getClass, type ClassDetail, type ClassResponse } from "@/services/classes.service";
import { listExams, type ExamResponse } from "@/services/exams.service";
import {
  getAssignmentReport,
  listAssignments,
  type AssignmentDetail,
  type AssignmentReportResponse,
} from "@/services/assignments.service";
import {
  getAntiCheatAnalyticsDashboard,
  getAntiCheatSubmissionTimeline,
  type AntiCheatAnalyticsDashboardResponse,
  type SubmissionTimelineResponse,
} from "@/services/antiCheatAnalytics.service";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/layouts/Icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/utils/date";
import { t, useLanguage, useTimezone } from "@/i18n";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

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
  const lang = useLanguage();
  const tz = useTimezone();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "anti-cheat" ? "anti-cheat" : "overview";

  const setActiveTab = (value: string) => {
    if (value === "anti-cheat") setSearchParams({ tab: "anti-cheat" });
    else setSearchParams({});
  };

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

  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [acData, setAcData] = useState<AntiCheatAnalyticsDashboardResponse | null>(null);
  const [acLoading, setAcLoading] = useState(false);
  const [acError, setAcError] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineSubmissionId, setTimelineSubmissionId] = useState<number | null>(null);
  const [timelineData, setTimelineData] = useState<SubmissionTimelineResponse | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

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
        setClasses(Array.isArray(c) ? c : []);
        setExams(Array.isArray(e) ? e : []);
        setAssignments(Array.isArray(a) ? a : []);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : t("teacherAnalytics.failed", lang));
      })
      .finally(() => {
        setLoading(false);
        setBaseLoaded(true);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (activeTab !== "anti-cheat") return;

    setAcLoading(true);
    setAcError("");
    const aid = assignmentFilter === "all" ? undefined : parseInt(assignmentFilter, 10);
    getAntiCheatAnalyticsDashboard(token, {
      assignment_id: Number.isFinite(aid) ? aid : undefined,
    })
      .then(setAcData)
      .catch((e) => {
        setAcError(e instanceof Error ? e.message : t("antiCheatAnalytics.loadFailed", lang));
        setAcData(null);
      })
      .finally(() => setAcLoading(false));
  }, [token, assignmentFilter, lang, activeTab]);

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

  const distributionChart = useMemo(() => {
    const raw = acData?.distribution;
    const rows = Array.isArray(raw) ? raw : [];
    return rows.map((d) => ({
      name: d.label,
      students: d.count,
    }));
  }, [acData]);

  const eventChart = useMemo(() => {
    const raw = acData?.event_breakdown;
    const rows = Array.isArray(raw) ? raw : [];
    return rows.map((e) => ({
      name: e.event_type,
      count: e.count,
      weight: e.weighted_contribution,
    }));
  }, [acData]);

  const refreshAntiCheat = () => {
    const aid = assignmentFilter === "all" ? undefined : parseInt(assignmentFilter, 10);
    if (!token) return;
    setAcLoading(true);
    getAntiCheatAnalyticsDashboard(token, { assignment_id: Number.isFinite(aid) ? aid : undefined })
      .then(setAcData)
      .catch((e) => {
        setAcError(e instanceof Error ? e.message : t("antiCheatAnalytics.loadFailed", lang));
        setAcData(null);
      })
      .finally(() => setAcLoading(false));
  };

  const openTimeline = (submissionId: number) => {
    if (!token) return;
    setTimelineSubmissionId(submissionId);
    setTimelineOpen(true);
    setTimelineLoading(true);
    setTimelineData(null);
    const aid = assignmentFilter === "all" ? undefined : parseInt(assignmentFilter, 10);
    getAntiCheatSubmissionTimeline(token, submissionId, {
      assignment_id: Number.isFinite(aid) ? aid : undefined,
    })
      .then(setTimelineData)
      .catch(() => setTimelineData(null))
      .finally(() => setTimelineLoading(false));
  };
  const topMissedQuestions = useMemo(() => {
    const map = new Map<number, { question_text: string; incorrect_count: number; total_answers: number }>();
    for (const report of reportCache.values()) {
      for (const item of report.top_missed_questions ?? []) {
        const existing = map.get(item.question_id);
        if (existing) {
          existing.incorrect_count += item.incorrect_count;
          existing.total_answers += item.total_answers;
        } else {
          map.set(item.question_id, {
            question_text: item.question_text,
            incorrect_count: item.incorrect_count,
            total_answers: item.total_answers,
          });
        }
      }
    }
    return Array.from(map.entries())
      .map(([question_id, item]) => ({
        question_id,
        ...item,
        incorrect_rate: item.total_answers > 0 ? (item.incorrect_count / item.total_answers) * 100 : 0,
      }))
      .sort((a, b) => b.incorrect_rate - a.incorrect_rate)
      .slice(0, 5);
  }, [statsLoading, statsProgress.reportsDone]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("teacherAnalytics.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("teacherAnalytics.subtitle", lang)}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("teacherAnalytics.tabOverview", lang)}</TabsTrigger>
          <TabsTrigger value="anti-cheat">{t("teacherAnalytics.tabAntiCheat", lang)}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className=" stat-card animate-in">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icons.Users className="size-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.myStudents}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("teacherDashboard.myStudents", lang)}</div>
            </div>
            <div className=" stat-card animate-in">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icons.BookOpen className="size-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.myExams}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("nav.exams", lang)}</div>
            </div>
            <div className=" stat-card animate-in">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
                  <Icons.CheckCircle className="size-5 text-info" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.submissions}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("teacherDashboard.submissions", lang)}</div>
            </div>
            <div className=" stat-card animate-in">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <Icons.Chart className="size-5 text-success" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.avgScore}</div>
              <div className="text-sm text-muted-foreground mt-1">{t("teacherDashboard.avgScore", lang)}</div>
            </div>
          </div>

          <div className="glass-card p-6">
            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : loading ? (
              <div className="space-y-3">
                <div className="h-4 w-2/3 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded-lg bg-muted animate-pulse" />
              </div>
            ) : (
              <div className="space-y-2">
                {statsLoading && (
                  <div className="text-xs text-muted-foreground">
                    {t("teacherDashboard.calculatingStats", lang)} {statsProgress.classesDone}/{statsProgress.classesTotal}{" "}
                    {t("teacherDashboard.classes", lang).toLowerCase()}, {statsProgress.reportsDone}/{statsProgress.reportsTotal}{" "}
                    assignments
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{t("teacherAnalytics.info", lang)}</div>
              </div>
            )}
          </div>

          {!loading && !error && topMissedQuestions.length > 0 ? (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("teacherAnalytics.topMissedTitle", lang)}</h3>
              <ul className="space-y-3">
                {topMissedQuestions.map((row) => (
                  <li key={row.question_id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm text-foreground line-clamp-2">{row.question_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("teacherAnalytics.incorrectRateLabel", { rate: row.incorrect_rate.toFixed(1) }, lang)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="anti-cheat" className="mt-0 space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Icons.Chart className="size-5 text-primary" />
                {t("antiCheatAnalytics.title", lang)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("antiCheatAnalytics.subtitle", lang)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder={t("antiCheatAnalytics.filterAssignment", lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("antiCheatAnalytics.allAssignments", lang)}</SelectItem>
                  {assignments.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.exam_title} · {a.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="secondary" disabled={acLoading} onClick={refreshAntiCheat}>
                <Icons.RefreshCw className="size-4" />
                {t("common.refresh", lang)}
              </Button>
            </div>
          </div>

          {acError ? <p className="text-destructive text-sm">{acError}</p> : null}

          {acLoading && !acData ? (
            <p className="text-muted-foreground">{t("common.loading", lang)}</p>
          ) : acData ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-xs text-muted-foreground">{t("antiCheatAnalytics.submissionsTracked", lang)}</div>
                  <div className="text-2xl font-bold">{acData.overview.submissions_tracked}</div>
                </div>
                <div className="stat-card">
                  <div className="text-xs text-muted-foreground">{t("antiCheatAnalytics.suspiciousLabel", lang)}</div>
                  <div className="text-2xl font-bold text-destructive">{acData.overview.suspicious_count}</div>
                </div>
                <div className="stat-card">
                  <div className="text-xs text-muted-foreground">{t("antiCheatAnalytics.maxScore", lang)}</div>
                  <div className="text-2xl font-bold">{acData.overview.max_weighted_score}</div>
                </div>
                <div className="stat-card">
                  <div className="text-xs text-muted-foreground">{t("antiCheatAnalytics.threshold", lang)}</div>
                  <div className="text-2xl font-bold">{acData.suspicious_threshold}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("antiCheatAnalytics.scoreDistribution", lang)}</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionChart}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="students"
                          name={t("antiCheatAnalytics.students", lang)}
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-lg font-semibold mb-4">{t("antiCheatAnalytics.eventBreakdown", lang)}</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name={t("antiCheatAnalytics.events", lang)} stackId="a">
                          {eventChart.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">{t("antiCheatAnalytics.leaderboard", lang)}</h3>
                  <p className="text-sm text-muted-foreground">{t("antiCheatAnalytics.leaderboardHint", lang)}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>{t("antiCheatAnalytics.student", lang)}</TableHead>
                      <TableHead>{t("antiCheatAnalytics.exam", lang)}</TableHead>
                      <TableHead className="text-right">{t("antiCheatAnalytics.weightedScore", lang)}</TableHead>
                      <TableHead>{t("antiCheatAnalytics.status", lang)}</TableHead>
                      <TableHead className="w-[140px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(acData.leaderboard) ? acData.leaderboard : []).map((row) => (
                      <TableRow key={row.submission_id}>
                        <TableCell className="font-mono">{row.rank}</TableCell>
                        <TableCell>
                          <div className="font-medium">{row.full_name}</div>
                          <div className="text-xs text-muted-foreground">{row.email}</div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{row.exam_title}</TableCell>
                        <TableCell className="text-right font-mono">{row.weighted_score}</TableCell>
                        <TableCell>
                          {row.suspicious ? (
                            <Badge variant="destructive">{t("antiCheatAnalytics.flagged", lang)}</Badge>
                          ) : (
                            <Badge variant="secondary">{t("antiCheatAnalytics.ok", lang)}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="outline" size="sm" onClick={() => openTimeline(row.submission_id)}>
                            <Icons.Clock className="size-4 mr-1" />
                            {t("antiCheatAnalytics.timeline", lang)}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>

      <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("antiCheatAnalytics.timelineTitle", lang)}
              {timelineSubmissionId != null ? ` · #${timelineSubmissionId}` : ""}
            </DialogTitle>
          </DialogHeader>
          {timelineLoading ? (
            <p className="text-muted-foreground">{t("common.loading", lang)}</p>
          ) : timelineData && Array.isArray(timelineData.events) && timelineData.events.length ? (
            <ul className="space-y-3 text-sm">
              {timelineData.events.map((ev) => (
                <li key={ev.id} className="border-b border-border/60 pb-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{ev.event_type}</span>
                    <span className="text-muted-foreground text-xs">{formatDateTime(ev.created_at, lang, tz)}</span>
                  </div>
                  <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-all">
                    {JSON.stringify(ev.meta, null, 0)}
                  </pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("antiCheatAnalytics.noEvents", lang)}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
