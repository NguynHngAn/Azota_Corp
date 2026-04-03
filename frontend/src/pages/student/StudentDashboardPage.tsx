import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listMyClasses, type ClassResponse } from "@/services/classes.service";
import { listMyAssignments, type AssignmentDetail } from "@/services/assignments.service";
import { Icons } from "@/components/layouts/Icons";
import { JoinClassPanel } from "@/components/features/student/join-class-panel";
import { Button } from "@/components/ui/button";
import { formatDateTimeVietnam } from "@/utils/date";
import { useNavigate } from "react-router";
import { Clock, Loader2 } from "lucide-react";
import { t, useLanguage } from "@/i18n";

function firstName(fullNameOrEmail?: string | null): string {
  const raw = (fullNameOrEmail || "").trim();
  if (!raw) return "Student";
  const parts = raw.split(/\s+/).filter(Boolean);
  return parts[0] || raw;
}

export function StudentDashboardPage() {
  const { token, user } = useAuth();
  const lang = useLanguage();
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
    return {
      classes: classes.length,
      submissions: 0,
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

  if (loading) {
    return (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
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
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icons.BookOpen className="size-5 text-primary" /></div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.classes}</div>
            <div className="text-sm text-muted-foreground">{t("nav.myClasses", lang)}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-5 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center"><Icons.CheckCircle className="size-5 text-success" /></div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.submissions}</div>
            <div className="text-sm text-muted-foreground">{t("teacherDashboard.submissions", lang)}</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-5 flex items-center gap-4">
          <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center"><Icons.FileText className="size-5 text-info" /></div>
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
              {t("common.viewAll", lang)} →
            </Button>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="py-8">
                <div className="h-10 bg-muted rounded-xl animate-pulse mb-3" />
                <div className="h-10 bg-muted rounded-xl animate-pulse" />
              </div>
            ) : upcomingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("studentDashboard.noUpcomingAssignments", lang)}
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Icons.FileText /></div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{a.exam_title}</div>
                        <div className="text-xs text-muted-foreground">{a.class_name} · {a.duration_minutes} min</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTimeVietnam(a.start_time)}
                      </div>
                      {new Date(a.start_time) <= new Date() && (
                        <Button
                        key={a.id}
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/student/assignments")}
                        className="h-auto w-full flex-col items-stretch rounded-xl border-muted bg-background px-4 py-3 text-left font-normal hover:bg-muted"
                        >
                          <div className="text-sm font-medium text-foreground">{a.exam_title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {a.class_name} · {formatDateTimeVietnam(a.start_time)}
                          </div>
                        </Button>
                      )}
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
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-foreground">{a.exam_title}</div>
                      <div className="text-xs text-muted-foreground">{a.start_time ? formatDateTimeVietnam(a.start_time) : t("studentDashboard.inProgress", lang)}</div>
                    </div>
                    <div className="text-right">
                      {/* {a.score != null ? (
                        <span className="text-lg font-bold text-primary">100%</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t("myAssignments.upcoming", lang)}</span>
                      )}  */}
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

