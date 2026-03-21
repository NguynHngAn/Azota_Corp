import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../context/AuthContext";
import { getSubmissionResult, listMySubmissions, type MySubmissionSummary } from "../../api/assignments";
import { formatDateTimeVietnam } from "../../utils/date";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function StudentResultsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<MySubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailMap, setDetailMap] = useState<Record<number, { correct: number; wrong: number; total: number }>>({});
  const [detailLoading, setDetailLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    listMySubmissions(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load results"))
      .finally(() => setLoading(false));
  }, [token]);

  // Prefetch lightweight correct/wrong summary for latest few results (UI polish).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const target = items.slice(0, 5).map((it) => it.submission_id);
    (async () => {
      for (const id of target) {
        if (cancelled) return;
        if (detailMap[id]) continue;
        setDetailLoading((m) => ({ ...m, [id]: true }));
        try {
          const res = await getSubmissionResult(id, token);
          const correct = res.question_results.filter((r) => r.correct).length;
          const total = res.question_results.length;
          const wrong = Math.max(total - correct, 0);
          if (!cancelled) {
            setDetailMap((m) => ({ ...m, [id]: { correct, wrong, total } }));
          }
        } catch {
          // Ignore per-item failures; keep UI responsive.
        } finally {
          if (!cancelled) setDetailLoading((m) => ({ ...m, [id]: false }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, token]);

  const hasAny = useMemo(() => items.length > 0, [items.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Results</h1>
        <p className="text-sm text-slate-500">Review your exam submissions and scores.</p>
      </div>

      <Card className="border border-slate-100 shadow-sm hover:shadow-sm">
        {loading ? (
          <div className="py-10 animate-pulse space-y-3">
            <div className="h-10 bg-slate-50 rounded-xl" />
            <div className="h-10 bg-slate-50 rounded-xl" />
            <div className="h-10 bg-slate-50 rounded-xl" />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <div className="text-sm font-medium text-rose-700">{error}</div>
            <div className="mt-4">
              <Button size="sm" variant="secondary" type="button" onClick={() => navigate(0)}>
                Retry
              </Button>
            </div>
          </div>
        ) : !hasAny ? (
          <div className="py-14 text-center">
            <div className="text-sm font-medium text-slate-700">No submissions yet.</div>
            <div className="text-sm text-slate-500 mt-1">
              Your results will appear here after you submit an exam.
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {items.map((it) => (
              <button
                key={it.submission_id}
                type="button"
                onClick={() => navigate(`/student/assignments/result/${it.submission_id}`)}
                className="w-full text-left rounded-2xl border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-slate-900 truncate">{it.exam_title}</div>
                    <Badge variant="default" className="bg-slate-50 text-slate-700 border border-slate-100">
                      Score: {it.score ?? 0}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {it.class_name} · {formatDateTimeVietnam(it.submitted_at)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {detailLoading[it.submission_id] ? (
                      <>
                        <span className="inline-block h-5 w-14 rounded-full bg-slate-50 animate-pulse" />
                        <span className="inline-block h-5 w-14 rounded-full bg-slate-50 animate-pulse" />
                        <span className="inline-block h-5 w-14 rounded-full bg-slate-50 animate-pulse" />
                      </>
                    ) : detailMap[it.submission_id] ? (
                      <>
                        <Badge variant="success">Correct: {detailMap[it.submission_id].correct}</Badge>
                        <Badge variant="danger">Wrong: {detailMap[it.submission_id].wrong}</Badge>
                        <Badge>Total: {detailMap[it.submission_id].total}</Badge>
                      </>
                    ) : (
                      <Badge className="bg-slate-50 text-slate-600 border border-slate-100">Summary: —</Badge>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-slate-500">Open</div>
                  <div className="text-sm font-semibold text-slate-900">View →</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

