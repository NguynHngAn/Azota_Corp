import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  getClass,
  listMembers,
  removeMember,
  updateClassTeacher,
  listClassTeachers,
  addClassTeachers,
  removeClassTeacher,
  type ClassDetail,
  type ClassMemberResponse,
} from "@/services/classes.service";
import { listUsers, type UserResponse } from "@/services/users.service";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function ClassDetailPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  function tr(key: string, values?: Record<string, string | number>) {
    const base = t(key as never, lang);
    if (!values) return base;
    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
      base,
    );
  }

  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [members, setMembers] = useState<ClassMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    getClass(classId, token)
      .then(setCls)
      .catch((e) => setError(e instanceof Error ? e.message : t("classDetail.loadFailed", lang)))
      .finally(() => setLoading(false));
  }, [token, id, classId]);

  useEffect(() => {
    if (!token || isNaN(classId)) return;
    listMembers(classId, token).then(setMembers).catch(() => {});
  }, [token, classId]);

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

  async function handleRemoveConfirmed(member: ClassMemberResponse) {
    if (!token) return;
    try {
      await removeMember(classId, member.user_id, token);
      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
    } catch {
      // ignore for now
    }
  }

  async function handleChangeTeacher(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!token || !cls) return;
    const teacherId = parseInt(e.target.value, 10);
    if (Number.isNaN(teacherId) || teacherId === cls.created_by) return;
    setUpdatingTeacher(true);
    try {
      const updated = await updateClassTeacher(cls.id, teacherId, token);
      setCls(updated);
      // Ensure primary teacher exists in class teacher list
      const updatedTeachers = await listClassTeachers(cls.id, token);
      setClassTeachers(updatedTeachers as unknown as UserResponse[]);
    } catch {
      // ignore error for now
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

  return (
    <div className="space-y-4">
      <div>
        <Link to={`${base}/classes`} className="text-sm text-primary hover:underline">
          ← {t("classDetail.backToClasses", lang)}
        </Link>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{cls.name}</h2>
            {cls.description && <p className="mt-1 text-sm text-muted-foreground">{cls.description}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{tr("classDetail.membersCount", { count: cls.member_count })}</p>
          </div>
          {base === "/admin" && (
            <div className="mt-2 sm:mt-0">
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
          )}
        </div>
      </div>

      {base === "/admin" && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">{t("classDetail.classTeachers", lang)}</h3>
              <p className="text-xs text-muted-foreground">
                {t("classDetail.classTeachersDescription", lang)}
              </p>
            </div>
            <Button type="button" onClick={() => setAddTeacherOpen(true)}>
              <Icons.Plus className="size-4" /> {t("classDetail.addTeacher", lang)}
            </Button>
          </div>

          {teacherNotice && (
            <p className={`text-sm ${teacherNotice.toLowerCase().includes("fail") ? "text-destructive" : "text-success"}`}>
              {teacherNotice}
            </p>
          )}

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
                            window.confirm(tr("classDetail.removeTeacherConfirm", { name: teacher.full_name, email: teacher.email }))
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
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{t("classDetail.inviteCode", lang)}</span>
        <code className="px-2 py-1 bg-muted border rounded text-sm text-foreground">{cls.invite_code}</code>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={copyCode}
        >
          {copied ? t("classDetail.copied", lang) : t("classDetail.copyCode", lang)}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={copyInviteLink}
        >
          {copied ? t("classDetail.copied", lang) : t("classDetail.copyInviteLink", lang)}
        </Button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("classDetail.members", lang)}</h3>
          <Badge variant="secondary">{tr("classDetail.totalMembers", { count: members.length })}</Badge>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("classDetail.noMembers", lang)}</p>
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
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.user?.full_name ?? "—"}</TableCell>
                  <TableCell>{m.user?.email ?? ""}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        const label = m.user?.full_name ?? t("classDetail.thisUser", lang);
                        if (window.confirm(tr("classDetail.removeMemberConfirm", { name: label }))) {
                          void handleRemoveConfirmed(m);
                        }
                      }}
                      className="h-auto p-0 text-xs text-destructive"
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

      {addTeacherOpen && (
        <div className="fixed inset-0 bg-background/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-1 text-foreground">{t("classDetail.addTeacherDialogTitle", lang)}</h3>
            <p className="text-sm text-muted-fore ground mb-4 text-foreground">
              {t("classDetail.addTeacherDialogDescription", lang)}
            </p>

            <div className="mb-3">
              <Input
                placeholder={t("common.searchByNameOrEmail", lang)}
                value={teacherQuery}
                onChange={(e) => setTeacherQuery(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-auto border rounded-md">
              {teachers
                .filter((t) => {
                  const q = teacherQuery.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    t.full_name.toLowerCase().includes(q) ||
                    t.email.toLowerCase().includes(q)
                  );
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
                            return prev.filter((id) => id !== teacher.id);
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
          </div>
        </div>
      )}
    </div>
  );
}
