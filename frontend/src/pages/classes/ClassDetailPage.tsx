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
import { Icons } from "@/components/layouts/icons";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function ClassDetailPage() {
  const { token } = useAuth();
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
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
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
      setTeacherNotice("Added teacher(s) successfully.");
    } catch (e) {
      setTeacherNotice(e instanceof Error ? e.message : "Failed to add teachers.");
    } finally {
      setSavingTeachers(false);
    }
  }

  async function handleRemoveTeacherConfirmed(t: UserResponse) {
    if (!token || !cls) return;
    setTeacherNotice("");
    try {
      await removeClassTeacher(cls.id, t.id, token);
      setClassTeachers((prev) => prev.filter((x) => x.id !== t.id));
      setTeacherNotice("Removed teacher successfully.");
    } catch (e) {
      setTeacherNotice(e instanceof Error ? e.message : "Failed to remove teacher.");
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error || !cls) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link to={`${base}/classes`} className="text-sm text-primary hover:underline">
          ← Back to classes
        </Link>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{cls.name}</h2>
            {cls.description && <p className="mt-1 text-sm text-muted-foreground">{cls.description}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Members: {cls.member_count}</p>
          </div>
          {base === "/admin" && (
            <div className="mt-2 sm:mt-0">
              <label className="text-xs font-medium text-muted-foreground mr-2">Primary teacher:</label>
              <select
                value={String(cls.created_by)}
                onChange={handleChangeTeacher}
                disabled={updatingTeacher}
                className="inline-block w-56 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {teachers.length === 0 && <option value={String(cls.created_by)}>—</option>}
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.email})
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
              <h3 className="text-sm font-semibold text-muted-foreground">Class teachers</h3>
              <p className="text-xs text-muted-foreground">
                Manage the list of teachers (role=teacher) assigned to this class.
              </p>
            </div>
            <Button type="button" onClick={() => setAddTeacherOpen(true)}>
              <Icons.Plus className="size-4" /> Add teacher
            </Button>
          </div>

          {teacherNotice && (
            <p className={`text-sm ${teacherNotice.toLowerCase().includes("fail") ? "text-destructive" : "text-success"}`}>
              {teacherNotice}
            </p>
          )}

          {classTeachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No teachers assigned to this class.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classTeachers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.full_name}{" "}
                      {t.id === cls.created_by && <Badge variant="default">Primary</Badge>}
                    </TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          if (
                            window.confirm(`Remove ${t.full_name} (${t.email}) from this class?`)
                          ) {
                            void handleRemoveTeacherConfirmed(t);
                          }
                        }}
                        className={`h-auto p-0 text-xs ${t.id === cls.created_by ? "text-muted-foreground cursor-not-allowed no-underline" : "text-destructive"}`}
                        disabled={t.id === cls.created_by}
                        title={t.id === cls.created_by ? "Reassign primary teacher first" : "Remove from class"}
                      >
                        Remove
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
        <span className="text-sm font-medium text-muted-foreground">Invite code:</span>
        <code className="px-2 py-1 bg-muted border rounded text-sm text-foreground">{cls.invite_code}</code>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={copyCode}
        >
          {copied ? "Copied!" : "Copy code"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={copyInviteLink}
        >
          {copied ? "Copied!" : "Copy invite link"}
        </Button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Members</h3>
          <Badge variant="secondary">Total: {members.length}</Badge>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                        const label = m.user?.full_name ?? "this user";
                        if (window.confirm(`Remove ${label} from this class?`)) {
                          void handleRemoveConfirmed(m);
                        }
                      }}
                      className="h-auto p-0 text-xs text-destructive"
                    >
                      Remove
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
            <h3 className="text-lg font-semibold mb-1 text-foreground">Add teacher to class</h3>
            <p className="text-sm text-muted-fore ground mb-4 text-foreground">
              Select one or more teachers (role=teacher). The system will automatically skip teachers already in the class.
            </p>

            <div className="mb-3">
              <Input
                placeholder="Search by name or email..."
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
                .map((t) => {
                  const already = classTeachers.some((ct) => ct.id === t.id);
                  const checked = selectedTeacherIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
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
                            if (next) return [...prev, t.id];
                            return prev.filter((id) => id !== t.id);
                          });
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">{t.full_name}</span>{" "}
                        <span className="text-muted-foreground">({t.email})</span>
                      </span>
                      {already && <Badge variant="outline">Added</Badge>}
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
                Cancel
              </Button>
              <Button type="button" disabled={savingTeachers || selectedTeacherIds.length === 0} onClick={handleAddTeachers}>
                {savingTeachers ? "Saving..." : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
