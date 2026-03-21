import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { listAssignments, type AssignmentDetail } from "../../api/assignments";
import { formatDateTimeVietnam } from "../../utils/date";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function AssignmentListPage() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const base = basePath(location.pathname);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!token) return;
    listAssignments(token)
      .then(setAssignments)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = assignments.filter((a) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    return `${a.exam_title} ${a.class_name}`.toLowerCase().includes(query);
  });

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
          <p className="text-sm text-slate-500">Schedule exams to classes with time windows.</p>
        </div>
        <Button onClick={() => navigate(`${base}/assignments/new`)}>+ New Assignment</Button>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <div className="max-w-md">
          <Input placeholder="Search assignments..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No assignments yet.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="text-sm font-medium text-slate-900 truncate">{a.exam_title}</div>
                      <div className="text-xs text-slate-500 truncate">{a.class_name}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDateTimeVietnam(a.start_time)} – {formatDateTimeVietnam(a.end_time)} · {a.duration_minutes} min
                    </div>
                  </div>
                  {base === "/teacher" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => navigate(`/teacher/assignments/${a.id}/report`)}
                    >
                      View report →
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
