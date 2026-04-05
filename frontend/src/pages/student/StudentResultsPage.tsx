import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getSubmissionResult, listMySubmissions, type MySubmissionSummary } from "@/services/assignments.service";
import { formatDateTimeVietnam } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t, useLanguage } from "@/i18n";
import { Icons } from "@/components/layouts/Icons";

export function StudentResultsPage() {
  const { token } = useAuth();
  const lang = useLanguage();
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
      .catch((e) => setError(e instanceof Error ? e.message : t("studentResults.failed", lang)))
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
        <h1 className="text-2xl font-semibold text-foreground">{t("studentResults.title", lang)}</h1>
        <p className="text-sm text-muted-foreground">{t("studentResults.subtitle", lang)}</p>
      </div>

      <div className="">
        {loading ? (
          <div className="py-10 animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted rounded-xl" />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <div className="text-sm font-medium text-destructive">{error}</div>
            <div className="mt-4">
              <Button size="sm" variant="secondary" type="button" onClick={() => navigate(0)}>
                {t("studentResults.retry", lang)}
              </Button>
            </div>
          </div>
        ) : !hasAny ? (
          <div className="text-center py-20 text-muted-foreground text-sm">{t("studentResults.empty", lang)}
            <div className="text-center text-muted-foreground text-sm mt-2">
              {t("studentResults.emptyHint", lang)}
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {items.map((it) => (
              <Button
                key={it.submission_id}
                type="button"
                variant="outline"
                onClick={() => navigate(`/student/assignments/result/${it.submission_id}`)}
                className="h-auto w-full justify-between gap-4 rounded-2xl border-border bg-card px-4 py-3 text-left font-normal hover:bg-secondary"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-foreground truncate">{it.exam_title}</div>
                    <Badge variant="secondary">{t("studentResults.score", lang)}: {it.score ?? 0}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {it.class_name} · {formatDateTimeVietnam(it.submitted_at)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {detailLoading[it.submission_id] ? (
                      <>
                        <span className="inline-block h-5 w-14 rounded-full bg-muted animate-pulse" />
                        <span className="inline-block h-5 w-14 rounded-full bg-muted animate-pulse" />
                        <span className="inline-block h-5 w-14 rounded-full bg-muted animate-pulse" />
                      </>
                    ) : detailMap[it.submission_id] ? (
                      <>
                        <Badge variant="default">{t("studentResults.correct", lang)}: {detailMap[it.submission_id].correct}</Badge>
                        <Badge variant="destructive">{t("studentResults.wrong", lang)}: {detailMap[it.submission_id].wrong}</Badge>
                        <Badge variant="secondary">{t("studentResults.total", lang)}: {detailMap[it.submission_id].total}</Badge>
                      </>
                    ) : (
                      <Badge variant="outline">{t("studentResults.summary", lang)}: —</Badge>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-muted-foreground">{t("studentResults.open", lang)}</div>
                  <div className="text-sm font-semibold text-foreground flex items-center">
                    {t("studentResults.view", lang)} <Icons.ArrowRight className="size-3 inline-block ml-1" />
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

