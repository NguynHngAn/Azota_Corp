import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { deleteExam, listExams, restoreExam, type ExamResponse } from "@/services/exams.service";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ExamListPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "deleted">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    listExams(token, { include_deleted: filter === "deleted" })
      .then((rows) => setExams(Array.isArray(rows) ? rows : []))
      .catch((e) => setError(e instanceof Error ? e.message : t("examList.failed", lang)))
      .finally(() => setLoading(false));
  }, [token, filter]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return exams.filter((e) => {
      if (filter === "deleted") return Boolean(e.deleted_at) && (!query || e.title.toLowerCase().includes(query));
      if (filter === "draft" && !e.is_draft) return false;
      if (filter === "published" && e.is_draft) return false;
      if (!query) return true;
      return e.title.toLowerCase().includes(query);
    });
  }, [exams, q, filter]);

  // async function handleDelete(examId: number) {
  //   await deleteExam(examId, token ?? "")
  //     .then(() => setExams((prev) => prev.filter((e) => e.id !== examId)))
  //     .catch((e) => setError(e instanceof Error ? e.message : t("examList.failed", lang)));
  // };

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  async function handleDeleteExam(examId: number) {
    if (!token) return;
    const ok = window.confirm("Xóa exam này? (Có thể khôi phục sau nếu cần)");
    if (!ok) return;
    setDeletingId(examId);
    try {
      await deleteExam(examId, token);
      setExams((prev) => prev.filter((e) => e.id !== examId));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("examList.failed", lang));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRestoreExam(examId: number) {
    if (!token) return;
    setDeletingId(examId);
    try {
      await restoreExam(examId, token);
      setExams((prev) => prev.filter((e) => e.id !== examId));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("examList.failed", lang));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("examList.title", lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("examList.subtitle", lang)}</p>
        </div>
        <Button className="gap-1.5 rounded-lg" onClick={() => navigate("/teacher/exams/new")}>+ {t("common.createExam", lang)}</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="search-input flex-1 max-w-sm ">
          <Icons.Search className="w-4 h-4" />
          <input
            type="text"
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            placeholder={t("examList.searchPlaceholder", lang)}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("common.all", lang) },
            { value: "published", label: t("common.status.published", lang) },
            { value: "draft", label: t("common.status.draft", lang) },
            { value: "deleted", label: t("common.status.deleted", lang) },
          ]}
        />
      </div>
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">{t("examList.empty", lang)}</div>
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("examList.title", lang)}</TableHead>
                  <TableHead>{t("common.status", lang)}</TableHead>
                  <TableHead className="text-right">{t("common.actions", lang)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>
                      {filter === "deleted" ? (
                        <Badge variant="destructive">{t("common.status.deleted", lang)}</Badge>
                      ):(
                        <Badge variant={e.is_draft ? "outline" : "default"}>
                          {e.is_draft 
                          ? t("common.status.draft", lang) 
                          : t("common.status.published", lang)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* View */}
                      {filter !== "deleted" && (
                        <Link
                          to={`/teacher/exams/${e.id}/detail`}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Button variant="outline" size="icon">
                            <Icons.Eye className="size-4 " />
                          </Button>
                        </Link>
                      )}
                      {/* Restore */}
                      {filter === "deleted" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={deletingId === e.id}
                          onClick={() => void handleRestoreExam(e.id)}
                        >
                          {deletingId === e.id ? t("common.restoring", lang) : t("common.restore", lang)}
                        </Button>
                      ) : (
                        // Delete
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={deletingId === e.id}
                          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          onClick={() => void handleDeleteExam(e.id)}
                        >
                          <Icons.Trash className="size-4" />
                        </Button>
                      )}
                      {/* {e.is_draft ? (
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(e.id)}
                        >
                          <Icons.Trash className="size-4 " />
                        </Button>
                      ) : null} */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
            {/* value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: t("common.all", lang) },
              { value: "published", label: t("common.status.published", lang) },
              { value: "draft", label: t("common.status.draft", lang) },
            { value: "deleted", label: t("common.status.deleted", lang) },
            ]}
          />
      </div>
      <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">{t("examList.empty", lang)}</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-border bg-card px-4 py-3 hover:bg-secondary/80 transition flex items-center justify-between gap-3"
                >
                  <Link
                    to={filter === "deleted" ? "#" : `/teacher/exams/${e.id}`}
                    onClick={(ev) => {
                      if (filter === "deleted") ev.preventDefault();
                    }}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-foreground truncate">{e.title}</div>
                      <Badge variant={e.is_draft ? "outline" : "default"}>
                        {e.is_draft ? t("common.status.draft", lang) : t("common.status.published", lang)}
                      </Badge>
                    </div>
                  </Link>
                    {filter === "deleted" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={deletingId === e.id}
                      onClick={() => void handleRestoreExam(e.id)}
                    >
                      {deletingId === e.id ? t("common.restoring", lang) : t("common.restore", lang)}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={deletingId === e.id}
                      onClick={() => void handleDeleteExam(e.id)}
                    >
                      {deletingId === e.id ? t("common.deleting", lang) : t("common.delete", lang)}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )} */}
      </div>

    </div>
  );
}
