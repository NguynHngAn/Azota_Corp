import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listMyClasses, type ClassResponse } from "../../api/classes";
import { listMyAssignments, type AssignmentDetail } from "../../api/assignments";
import { StatsCard } from "../../components/admin/StatsCard";
import { Icons } from "../../components/admin/icons";
import { JoinClassPanel } from "../../components/student/JoinClassPanel";
import { Card } from "../../components/ui/card";
import { formatDateTimeVietnam } from "../../utils/date";
import { useNavigate } from "react-router";

function firstName(fullNameOrEmail?: string | null): string {
  const raw = (fullNameOrEmail || "").trim();
  if (!raw) return "Student";
  const parts = raw.split(/\s+/).filter(Boolean);
  return parts[0] || raw;
}

export function StudentDashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Hello, {firstName(user?.full_name || user?.email)}{" "}
          <span className="text-slate-400">👋</span>
        </h1>
        <p className="text-sm text-slate-500">Here’s your learning overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard icon={<Icons.Layers />} value={stats.classes} label="My Classes" tone="violet" />
        <StatsCard icon={<Icons.Clipboard />} value={stats.submissions} label="Submissions" tone="green" />
        <StatsCard icon={<Icons.Book />} value={stats.upcoming} label="Upcoming" tone="blue" />
      </div>

      <JoinClassPanel compact />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-slate-100 shadow-sm hover:shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">Upcoming Assignments</div>
            <button
              type="button"
              onClick={() => navigate("/student/assignments")}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-2 py-1 rounded-lg transition"
            >
              View all →
            </button>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="py-8">
                <div className="h-10 bg-slate-50 rounded-xl animate-pulse mb-3" />
                <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
              </div>
            ) : upcomingAssignments.length === 0 ? (
              <div className="text-sm text-slate-500 py-8 text-center">
                No upcoming assignments. Check “Assignments” to see all assigned exams.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAssignments.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => navigate("/student/assignments")}
                    className="w-full text-left rounded-xl border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition"
                  >
                    <div className="text-sm font-medium text-slate-900">{a.exam_title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {a.class_name} · {formatDateTimeVietnam(a.start_time)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="border border-slate-100 shadow-sm hover:shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Recent Results</div>
          <div className="mt-3">
            <div className="text-sm text-slate-500 py-8 text-center">No submissions yet.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

