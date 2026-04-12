import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { deleteAssignment, listAssignments, restoreAssignment, type AssignmentDetail } from "@/services/assignments.service";
import { formatDateTime } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage, useTimezone } from "@/i18n";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function AssignmentListPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const tz = useTimezone();
  const location = useLocation();
  const navigate = useNavigate();
  const base = basePath(location.pathname);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "deleted" ? "deleted" : "active";
  const setActiveTab = (value: string) => {
    if (value === "deleted") setSearchParams({ tab: "deleted" });
    else setSearchParams({});
  };

  useEffect(() => {
    if (!token) return;

    listAssignments(token, { include_deleted: activeTab === "deleted" })
      .then((rows) => setAssignments(Array.isArray(rows) ? rows : []))
      .catch((e) => setError(e instanceof Error ? e.message : t("assignmentList.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, activeTab, lang]);

  async function handleDelete(id: number) {
    if (!token) return;
    const ok = window.confirm(t("assignmentList.deleteConfirm", lang));
    if (!ok) return;
    setDeletingId(id);
    try {
      await deleteAssignment(id, token);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.deleteFailed", lang));
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
      setError(e instanceof Error ? e.message : t("common.restoreFailed", lang));
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = assignments.filter((a) => {
    const query = q.trim().toLowerCase();
    if (activeTab === "active" && a.deleted_at) return false;
    if (activeTab === "deleted" && !a.deleted_at) return false;
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="deleted">Deleted</TabsTrigger>
        </TabsList>
      </Tabs>
      <div>
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
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
                        <Icons.Minus className="size-3" />
                        {a.class_name}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Icons.Calendar className="size-3" /> {formatDateTime(a.start_time, lang, tz)} – {formatDateTime(a.end_time, lang, tz)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Icons.Clock className="size-3" /> {a.duration_minutes} {t("common.minutes", lang)}
                    </div>
                  </div>
                  {base === "/teacher" ? (
                    <div className="flex items-center gap-2">
                      {activeTab === "deleted" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          type="button"
                          disabled={deletingId === a.id}
                          className="text-sm hover:text-primary hover:bg-secondary"
                          onClick={() => void handleRestore(a.id)}
                        >
                          <Icons.ArchiveRestore className="size-3 inline-block mr-1" />
                          {deletingId === a.id ? t("common.restoring", lang) : t("common.restore", lang)}
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            disabled={deletingId === a.id}
                            className="text-sm hover:text-destructive hover:bg-destructive/10"
                            onClick={() => void handleDelete(a.id)}
                          >
                            <Icons.Trash2 className="size-3 inline-block mr-1" />{deletingId === a.id ? t("common.deleting", lang) : t("common.delete", lang)}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="text-sm hover:text-primary hover:bg-secondary"
                            onClick={() => navigate(`/teacher/assignments/${a.id}/report`)}
                          >
                            {t("assignmentList.viewReport", lang)} <Icons.ArrowRight className="size-3 inline-block ml-1" />
                          </Button>
                        </>
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
