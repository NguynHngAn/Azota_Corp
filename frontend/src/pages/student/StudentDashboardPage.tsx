import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyClasses, type ClassResponse } from "@/services/classes.service";
import { listMyAssignments, type AssignmentDetail } from "@/services/assignments.service";
import { Icons } from "@/components/layouts/Icons";
import { JoinClassPanel } from "@/components/features/student/join-class-panel";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/date";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { t, useLanguage, useTimezone } from "@/i18n";

function firstName(fullNameOrEmail?: string | null): string {
  const raw = (fullNameOrEmail || "").trim();
  if (!raw) return "Student";
  const parts = raw.split(/\s+/).filter(Boolean);
  return parts[0] || raw;
}

function formatScorePercent(score: number): string {
  const n = Number(score);
  if (!Number.isFinite(n)) return "—";
  const label = Number.isInteger(n) ? String(Math.round(n)) : n.toFixed(1);
  return `${label}`;
}

/** Maps 0–100 score to red (low) → amber → green (high). */
function scorePercentColorClass(score: number): string {
  const n = Math.min(100, Math.max(0, Number(score)));
  if (!Number.isFinite(n)) return "text-muted-foreground";
  if (n < 40) return "text-red-600 dark:text-red-400";
  if (n < 55) return "text-orange-600 dark:text-orange-400";
  if (n < 70) return "text-amber-600 dark:text-amber-400";
  if (n < 82) return "text-lime-600 dark:text-lime-400";
  if (n < 92) return "text-emerald-600 dark:text-emerald-400";
  return "text-green-600 dark:text-green-400";
}

export function StudentDashboardPage() {
  const { token, user } = useAuth();
  const lang = useLanguage();
  const tz = useTimezone();
  const navigate = useNavigate();
  function tr(key: string, values?: Record<string, string | number>) {
    const base = t(key as never, lang);
    if (!values) return base;
    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
      base,
    );
  }

  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      listMyClasses(token).catch(() => [] as ClassResponse[]),
      listMyAssignments(token).catch(() => [] as AssignmentDetail[]),
    ])
      .then(([c, a]) => {
        setClasses(c);
        setAssignments(a);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = assignments.filter((a) => new Date(a.start_time) > now).length;
    const submissions = assignments.filter((a) => a.score != null).length;
    return {
      classes: classes.length,
      submissions,
      upcoming,
    };
  }, [assignments, classes.length]);

  const upcomingAssignments = useMemo(() => {
    const now = new Date();
    return assignments
      .filter((a) => new Date(a.start_time) > now)
      .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))
      .slice(0, 3);
  }, [assignments]);

  const recentGraded = useMemo(() => {
    return assignments
      .filter((a) => a.score != null)
      .sort((a, b) => +new Date(b.end_time) - +new Date(a.end_time))
      .slice(0, 5);
  }, [assignments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {tr("studentDashboard.greeting", { name: firstName(user?.full_name || user?.email) })}{" "}
          <span className="text-foreground">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("studentDashboard.subtitle", lang)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-5 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icons.BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.classes}</div>
            <div className="text-sm text-muted-foreground">{t("nav.myClasses", lang)}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-5 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Icons.CheckCircle className="size-5 text-success" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.submissions}</div>
            <div className="text-sm text-muted-foreground">{t("studentDashboard.submitted", lang)}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-5 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Icons.FileText className="size-5 text-info" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.upcoming}</div>
            <div className="text-sm text-muted-foreground">{t("studentDashboard.upcoming", lang)}</div>
          </div>
        </div>
      </div>

      <JoinClassPanel compact />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t("studentDashboard.upcomingAssignments", lang)}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/assignments")}
              className="text-xs font-medium text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              {t("common.viewAll", lang)} <Icons.ArrowRight className="size-3 inline-block ml-1" />
            </Button>
          </div>
          <div className="mt-3">
            {upcomingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("studentDashboard.noUpcomingAssignments", lang)}</p>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icons.FileText />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{a.exam_title}</div>
                        <div className="text-xs text-muted-foreground">
                          {a.class_name} · {a.duration_minutes} {t("common.minutes", lang)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Icons.Clock className="w-3 h-3 shrink-0" />
                        {formatDateTime(a.start_time, lang, tz)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("studentDashboard.recentResults", lang)}</h3>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("studentDashboard.noSubmissions", lang)}</p>
          ) : recentGraded.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("studentDashboard.noGradedYet", lang)}</p>
          ) : (
            <div className="space-y-3">
              {recentGraded.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-foreground">{a.exam_title}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(a.end_time, lang, tz)}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn("text-lg font-bold tabular-nums", scorePercentColorClass(a.score as number))}
                    >
                      {formatScorePercent(a.score as number)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
