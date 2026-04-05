import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { createClass, listClasses, type ClassResponse } from "@/services/classes.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTableLayout } from "@/components/features/admin/data-table-layout";
import { t, useLanguage } from "@/i18n";

export function AdminClassesPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    listClasses(token, { includeArchived: true })
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : t("adminClasses.failed", lang)))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(query) || (c.description || "").toLowerCase().includes(query));
  }, [classes, q]);

  async function handleCreate() {
    if (!token) return;
    setNotice("");
    if (!name.trim()) {
      setNotice(t("adminClasses.requiredName", lang));
      return;
    }
    setCreating(true);
    try {
      const created = await createClass({ name: name.trim(), description: description.trim() || null }, token);
      setClasses((prev) => [...prev, created]);
      setCreateOpen(false);
      setName("");
      setDescription("");
      setNotice(t("adminClasses.created", lang));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : t("adminClasses.createFailed", lang));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("classList.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("classList.teacherSubtitle", lang)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>+ {t("classList.new", lang)}</Button>
        </div>
      </div>

      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-destructive" : "text-primary"}`}>
          {notice}
        </p>
      )}

      <DataTableLayout
        title={t("adminClasses.management", lang)}
        loading={loading}
        error={error}
        isEmpty={filtered.length === 0}
        emptyMessage={t("adminClasses.empty", lang)}
        controls={
          <div className="w-full sm:w-96">
            <Input placeholder={t("classList.searchPlaceholder", lang)} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("classList.title", lang)}</TableHead>
              <TableHead>{t("examEditor.description", lang)}</TableHead>
              <TableHead className="text-right">{t("common.actions", lang)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {c.name}
                    {c.is_archived ? (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {t("classSettings.archivedBadge", lang)}
                      </Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.description || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/classes/${c.id}`)}
                  >
                    {t("adminClasses.open", lang)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableLayout>

      <Dialog open={createOpen} onOpenChange={(open) => !creating && setCreateOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminClasses.createTitle", lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
          <div>
              <label className="mb-1 block text-xs font-medium text-foreground">{t("adminClasses.className", lang)} *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("adminClasses.classNamePlaceholder", lang)} />
          </div>
          <div>
              <label className="mb-1 block text-xs font-medium text-foreground">{t("examEditor.description", lang)}</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("adminClasses.descriptionPlaceholder", lang)} />
          </div>
            {notice && <p className="text-sm text-destructive">{notice}</p>}
          </div>
          <DialogFooter>
            <Button className="w-full" disabled={creating} onClick={handleCreate}>
              {creating ? t("createClass.creating", lang) : t("adminClasses.createClass", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

