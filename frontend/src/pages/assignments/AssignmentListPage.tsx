import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { deleteAssignment, listAssignments, restoreAssignment, type AssignmentDetail } from "@/services/assignments.service";
import { formatDateTimeVietnam } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function AssignmentListPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const base = basePath(location.pathname);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [tab, setTab] = useState<"active" | "deleted">("active");

  useEffect(() => {
    if (!token) return;
    listAssignments(token, { include_deleted: tab === "deleted" })
      .then(setAssignments)
      .catch((e) => setError(e instanceof Error ? e.message : t("assignmentList.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, tab]);

  async function handleDelete(id: number) {
    if (!token) return;
    const ok = window.confirm("Xóa assignment này? (Có thể khôi phục sau nếu cần)");
    if (!ok) return;
    setDeletingId(id);
    try {
      await deleteAssignment(id, token);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestore(id: number) {
    if (!token) return;
    setDeletingId(id);
    try {
      await restoreAssignment(id, token);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = assignments.filter((a) => {
    const query = q.trim().toLowerCase();
    if (tab === "active" && a.deleted_at) return false;
    if (tab === "deleted" && !a.deleted_at) return false;
    if (!query) return true;
    return `${a.exam_title} ${a.class_name}`.toLowerCase().includes(query);
  });

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("assignmentList.title", lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("assignmentList.subtitle", lang)}</p>
        </div>
        <Button onClick={() => navigate(`${base}/assignments/new`)}><Icons.Plus className="size-4" /> {t("assignmentList.new", lang)}</Button>
      </div>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button type="button" variant={tab === "active" ? "secondary" : "outline"} onClick={() => setTab("active")}>
            Active
          </Button>
          <Button type="button" variant={tab === "deleted" ? "secondary" : "outline"} onClick={() => setTab("deleted")}>
            Deleted
          </Button>
        </div>
        <div className="search-input max-w-md">
          <Icons.Search className="size-4" />
          <input
            type="text"
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            placeholder={t("assignmentList.searchPlaceholder", lang)}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("assignmentList.empty", lang)}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => (
                <div
                  key={a.id}
                  className="glass-card p-6 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="text-sm font-medium text-foreground truncate">{a.exam_title}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.class_name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTimeVietnam(a.start_time)} – {formatDateTimeVietnam(a.end_time)} · {a.duration_minutes} min
                    </div>
                  </div>
                  {base === "/teacher" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => navigate(`/teacher/assignments/${a.id}/report`)}
                      >
                        {t("assignmentList.viewReport", lang)} →
                      </Button>
                      {tab === "deleted" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          type="button"
                          disabled={deletingId === a.id}
                          onClick={() => void handleRestore(a.id)}
                        >
                          {deletingId === a.id ? "Restoring..." : "Restore"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={deletingId === a.id}
                          onClick={() => void handleDelete(a.id)}
                        >
                          {deletingId === a.id ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
