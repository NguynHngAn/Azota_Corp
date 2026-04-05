import { useEffect, useId, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  archiveClass,
  getClass,
  updateClass,
  updateClassTeacher,
  listClassTeachers,
  addClassTeachers,
  removeClassTeacher,
  type ClassDetail,
} from "@/services/classes.service";
import { listUsers, type UserResponse } from "@/services/users.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";
import { classBasePath } from "@/pages/classes/classRoutes";

function tr(lang: ReturnType<typeof useLanguage>, key: string, values?: Record<string, string | number>) {
  const base = t(key as never, lang);
  if (!values) return base;
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
    base,
  );
}

export function ClassSettingsPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const base = classBasePath(location.pathname);
  const nameFieldId = useId();
  const descFieldId = useId();

  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const [teachers, setTeachers] = useState<UserResponse[]>([]);
  const [classTeachers, setClassTeachers] = useState<UserResponse[]>([]);
  const [updatingTeacher, setUpdatingTeacher] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [savingTeachers, setSavingTeachers] = useState(false);
  const [teacherNotice, setTeacherNotice] = useState("");

  const classId = id ? parseInt(id, 10) : NaN;
  const subBase = `${base}/classes/${classId}`;

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    setLoading(true);
    setError("");
    getClass(classId, token)
      .then((c) => {
        setCls(c);
        setName(c.name);
        setDescription(c.description ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("classDetail.loadFailed", lang)))
      .finally(() => setLoading(false));
  }, [token, id, classId, lang]);

  useEffect(() => {
    if (!token || base !== "/admin") return;
    listUsers(token, "teacher")
      .then(setTeachers)
      .catch(() => {});
  }, [token, base]);

  useEffect(() => {
    if (!token || base !== "/admin" || isNaN(classId)) return;
    listClassTeachers(classId, token)
      .then((rows) => setClassTeachers(rows as unknown as UserResponse[]))
      .catch(() => {});
  }, [token, base, classId]);

  function copyInviteLink() {
    if (!cls) return;
    const url = `${window.location.origin}/student/join?code=${encodeURIComponent(cls.invite_code)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyCode() {
    if (!cls) return;
    navigator.clipboard.writeText(cls.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !cls) return;
    setNotice("");
    setSaving(true);
    try {
      const updated = await updateClass(
        classId,
        { name: name.trim(), description: description.trim() || null },
        token,
      );
      setCls((c) => (c ? { ...c, name: updated.name, description: updated.description } : c));
      setNotice(t("classSettings.saved", lang));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : t("classSettings.saveFailed", lang));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!token || !cls || cls.is_archived) return;
    if (!window.confirm(t("classSettings.archiveConfirm", lang))) return;
    setArchiving(true);
    setNotice("");
    try {
      const updated = await archiveClass(classId, token);
      setCls((c) => (c ? { ...c, is_archived: updated.is_archived } : c));
      navigate(`${base}/classes`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : t("classSettings.archiveFailed", lang));
    } finally {
      setArchiving(false);
    }
  }

  async function handleChangeTeacher(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!token || !cls) return;
    const teacherId = parseInt(e.target.value, 10);
    if (Number.isNaN(teacherId) || teacherId === cls.created_by) return;
    setUpdatingTeacher(true);
    try {
      const updated = await updateClassTeacher(cls.id, teacherId, token);
      setCls((c) =>
        c
          ? {
              ...c,
              created_by: updated.created_by,
            }
          : c,
      );
      const updatedTeachers = await listClassTeachers(cls.id, token);
      setClassTeachers(updatedTeachers as unknown as UserResponse[]);
    } catch {
      // ignore
    } finally {
      setUpdatingTeacher(false);
    }
  }

  async function handleAddTeachers() {
    if (!token || !cls || selectedTeacherIds.length === 0) return;
    setSavingTeachers(true);
    setTeacherNotice("");
    try {
      const updated = await addClassTeachers(cls.id, selectedTeacherIds, token);
      setClassTeachers(updated as unknown as UserResponse[]);
      setSelectedTeacherIds([]);
      setTeacherQuery("");
      setAddTeacherOpen(false);
      setTeacherNotice(t("classDetail.addTeacherSuccess", lang));
    } catch (e) {
      setTeacherNotice(e instanceof Error ? e.message : t("classDetail.addTeacherFailed", lang));
    } finally {
      setSavingTeachers(false);
    }
  }

  async function handleRemoveTeacherConfirmed(teacher: UserResponse) {
    if (!token || !cls) return;
    setTeacherNotice("");
    try {
      await removeClassTeacher(cls.id, teacher.id, token);
      setClassTeachers((prev) => prev.filter((x) => x.id !== teacher.id));
      setTeacherNotice(t("classDetail.removeTeacherSuccess", lang));
    } catch (e) {
      setTeacherNotice(e instanceof Error ? e.message : t("classDetail.removeTeacherFailed", lang));
    }
  }

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error || !cls) return <p className="text-destructive">{error || t("classDetail.notFound", lang)}</p>;
  if (!cls.can_manage) {
    return (
      <div className="space-y-4">
        <Link to={subBase} className="text-sm text-primary hover:underline flex items-center gap-2">
          <Icons.ArrowLeft className="size-4" /> {t("classSettings.backToClass", lang)}
        </Link>
        <p className="text-destructive">{t("classSettings.accessDenied", lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link to={`${base}/classes`} className="text-sm text-primary hover:underline flex items-center gap-2">
          <Icons.ArrowLeft className="size-4" /> {t("classDetail.backToClasses", lang)}
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link to={subBase} className="text-sm text-primary hover:underline">
          {cls.name}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={subBase}>{t("classNav.classOverview", lang)}</Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={`${subBase}/members`}>{t("classNav.members", lang)}</Link>
        </Button>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">{t("classSettings.title", lang)}</h3>
        <form onSubmit={handleSaveMeta} className="space-y-3 max-w-lg">
          <div>
            <label htmlFor={nameFieldId} className="block text-xs font-medium text-muted-foreground mb-1">
              {t("createClass.name", lang)}
            </label>
            <Input id={nameFieldId} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor={descFieldId} className="block text-xs font-medium text-muted-foreground mb-1">
              {t("createClass.description", lang)}
            </label>
            <Textarea id={descFieldId} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          {notice ? (
            <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-destructive" : "text-primary"}`}>{notice}</p>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? t("common.saving", lang) : t("classSettings.save", lang)}
          </Button>
        </form>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t("classDetail.inviteCode", lang)}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <code className="px-2 py-1 bg-muted border rounded text-sm text-foreground">{cls.invite_code}</code>
          <Button type="button" variant="secondary" className="text-xs" onClick={copyCode}>
            {copied ? t("classDetail.copied", lang) : t("classDetail.copyCode", lang)}
          </Button>
          <Button type="button" variant="secondary" className="text-xs" onClick={copyInviteLink}>
            {copied ? t("classDetail.copied", lang) : t("classDetail.copyInviteLink", lang)}
          </Button>
        </div>
      </div>

      {!cls.is_archived ? (
        <div className="glass-card p-6 border-destructive/30">
          <h3 className="text-sm font-semibold text-destructive">{t("classSettings.dangerZone", lang)}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("classSettings.archiveHint", lang)}</p>
          <Button type="button" variant="destructive" className="mt-3" disabled={archiving} onClick={() => void handleArchive()}>
            {archiving ? t("common.loading", lang) : t("classSettings.archive", lang)}
          </Button>
        </div>
      ) : null}

      {base === "/admin" && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label className="text-xs font-medium text-muted-foreground mr-2">{t("classDetail.primaryTeacher", lang)}</label>
              <select
                value={String(cls.created_by)}
                onChange={handleChangeTeacher}
                disabled={updatingTeacher}
                className="inline-block w-56 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {teachers.length === 0 && <option value={String(cls.created_by)}>—</option>}
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">{t("classDetail.classTeachers", lang)}</h3>
                <p className="text-xs text-muted-foreground">{t("classDetail.classTeachersDescription", lang)}</p>
              </div>
              <Button type="button" onClick={() => setAddTeacherOpen(true)}>
                <Icons.Plus className="size-4" /> {t("classDetail.addTeacher", lang)}
              </Button>
            </div>

            {teacherNotice ? (
              <p className={`text-sm ${teacherNotice.toLowerCase().includes("fail") ? "text-destructive" : "text-success"}`}>
                {teacherNotice}
              </p>
            ) : null}

            {classTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("classDetail.noTeachers", lang)}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name", lang)}</TableHead>
                    <TableHead>{t("common.email", lang)}</TableHead>
                    <TableHead className="text-right">{t("common.actions", lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        {teacher.full_name}{" "}
                        {teacher.id === cls.created_by && <Badge variant="default">{t("classDetail.primary", lang)}</Badge>}
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => {
                            if (
                              window.confirm(tr(lang, "classDetail.removeTeacherConfirm", { name: teacher.full_name, email: teacher.email }))
                            ) {
                              void handleRemoveTeacherConfirmed(teacher);
                            }
                          }}
                          className={`h-auto p-0 text-xs ${teacher.id === cls.created_by ? "text-muted-foreground cursor-not-allowed no-underline" : "text-destructive"}`}
                          disabled={teacher.id === cls.created_by}
                          title={teacher.id === cls.created_by ? t("classDetail.reassignPrimaryTeacherFirst", lang) : t("classDetail.removeFromClass", lang)}
                        >
                          {t("common.remove", lang)}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {addTeacherOpen && (
        <div className="fixed inset-0 bg-background/40 flex items-center justify-center z-50">
          <Card className="max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-1 text-foreground">{t("classDetail.addTeacherDialogTitle", lang)}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("classDetail.addTeacherDialogDescription", lang)}</p>

            <div className="mb-3">
              <Input
                placeholder={t("common.searchByNameOrEmail", lang)}
                value={teacherQuery}
                onChange={(e) => setTeacherQuery(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-auto border rounded-md">
              {teachers
                .filter((u) => {
                  const q = teacherQuery.trim().toLowerCase();
                  if (!q) return true;
                  return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                })
                .map((teacher) => {
                  const already = classTeachers.some((ct) => ct.id === teacher.id);
                  const checked = selectedTeacherIds.includes(teacher.id);
                  return (
                    <label
                      key={teacher.id}
                      className={`flex items-center gap-3 px-3 py-2 text-sm border-b last:border-b-0 ${
                        already ? "opacity-50" : "hover:bg-secondary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={already}
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setSelectedTeacherIds((prev) => {
                            if (next) return [...prev, teacher.id];
                            return prev.filter((x) => x !== teacher.id);
                          });
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">{teacher.full_name}</span>{" "}
                        <span className="text-muted-foreground">({teacher.email})</span>
                      </span>
                      {already && <Badge variant="outline">{t("classDetail.alreadyAdded", lang)}</Badge>}
                    </label>
                  );
                })}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setAddTeacherOpen(false);
                  setSelectedTeacherIds([]);
                  setTeacherQuery("");
                }}
              >
                {t("common.cancel", lang)}
              </Button>
              <Button type="button" disabled={savingTeachers || selectedTeacherIds.length === 0} onClick={handleAddTeachers}>
                {savingTeachers ? t("common.saving", lang) : t("common.add", lang)}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
