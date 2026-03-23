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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [memberToRemove, setMemberToRemove] = useState<ClassMemberResponse | null>(null);

  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [savingTeachers, setSavingTeachers] = useState(false);
  const [teacherToRemove, setTeacherToRemove] = useState<UserResponse | null>(null);
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

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error || !cls) return <p className="text-red-600">{error || "Not found"}</p>;

  return (
    <div className="space-y-4">
      <div>
        <Link to={`${base}/classes`} className="text-sm text-blue-600 hover:underline">
          ← Back to classes
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{cls.name}</h2>
            {cls.description && <p className="mt-1 text-sm text-gray-600">{cls.description}</p>}
            <p className="mt-1 text-xs text-gray-500">Members: {cls.member_count}</p>
          </div>
          {base === "/admin" && (
            <div className="mt-2 sm:mt-0">
              <label className="text-xs font-medium text-gray-700 mr-2">Primary teacher:</label>
              <select
                value={String(cls.created_by)}
                onChange={handleChangeTeacher}
                disabled={updatingTeacher}
                className="inline-block w-56 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
      </Card>

      {base === "/admin" && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Giáo viên phụ trách lớp</h3>
              <p className="text-xs text-gray-500">
                Quản lý danh sách giáo viên (role=teacher) được gán cho lớp này.
              </p>
            </div>
            <Button type="button" onClick={() => setAddTeacherOpen(true)}>
              Thêm giáo viên
            </Button>
          </div>

          {teacherNotice && (
            <p className={`text-sm ${teacherNotice.toLowerCase().includes("fail") ? "text-red-600" : "text-green-700"}`}>
              {teacherNotice}
            </p>
          )}

          {classTeachers.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có giáo viên nào được gán cho lớp.</p>
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
                      {t.id === cls.created_by && <Badge variant="success">Primary</Badge>}
                    </TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setTeacherToRemove(t)}
                        className={`h-auto p-0 text-xs ${t.id === cls.created_by ? "text-gray-400 cursor-not-allowed no-underline" : "text-red-600"}`}
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
        </Card>
      )}

      <Card className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-800">Invite code:</span>
        <code className="px-2 py-1 bg-gray-50 border rounded text-sm">{cls.invite_code}</code>
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
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Members</h3>
          <Badge variant="default">Total: {members.length}</Badge>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No members yet.</p>
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
                      onClick={() => setMemberToRemove(m)}
                      className="h-auto p-0 text-xs text-red-600"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={memberToRemove != null}
        title="Remove member"
        description={
          memberToRemove
            ? `Remove ${memberToRemove.user?.full_name ?? "this user"} from this class?`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (memberToRemove) {
            handleRemoveConfirmed(memberToRemove);
          }
          setMemberToRemove(null);
        }}
        onCancel={() => setMemberToRemove(null)}
      />

      <ConfirmDialog
        open={teacherToRemove != null}
        title="Remove teacher"
        description={
          teacherToRemove
            ? `Remove ${teacherToRemove.full_name} (${teacherToRemove.email}) from this class?`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (teacherToRemove) {
            handleRemoveTeacherConfirmed(teacherToRemove);
          }
          setTeacherToRemove(null);
        }}
        onCancel={() => setTeacherToRemove(null)}
      />

      {addTeacherOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-1">Thêm giáo viên vào lớp</h3>
            <p className="text-sm text-gray-600 mb-4">
              Chọn một hoặc nhiều giáo viên (role=teacher). Hệ thống sẽ tự bỏ qua giáo viên đã có trong lớp.
            </p>

            <div className="mb-3">
              <Input
                placeholder="Tìm theo tên hoặc email..."
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
                        already ? "opacity-50" : "hover:bg-gray-50"
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
                        <span className="font-medium text-gray-900">{t.full_name}</span>{" "}
                        <span className="text-gray-500">({t.email})</span>
                      </span>
                      {already && <Badge variant="default">Added</Badge>}
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
