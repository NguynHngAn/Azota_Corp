import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getClass,
  listMembers,
  removeMember,
  updateClassTeacher,
  type ClassDetail,
  type ClassMemberResponse,
} from "../../api/classes";
import { listUsers, type UserResponse } from "../../api/users";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function ClassDetailPage() {
  const { token, user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [members, setMembers] = useState<ClassMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [teachers, setTeachers] = useState<UserResponse[]>([]);
  const [updatingTeacher, setUpdatingTeacher] = useState(false);

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

  async function handleRemove(userId: number) {
    if (!token || !confirm("Remove this member?")) return;
    try {
      await removeMember(classId, userId, token);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch {}
  }

  async function handleChangeTeacher(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!token || !cls) return;
    const teacherId = parseInt(e.target.value, 10);
    if (Number.isNaN(teacherId) || teacherId === cls.created_by) return;
    setUpdatingTeacher(true);
    try {
      const updated = await updateClassTeacher(cls.id, teacherId, token);
      setCls(updated);
    } catch {
      // ignore error for now
    } finally {
      setUpdatingTeacher(false);
    }
  }

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error || !cls) return <p className="text-red-600">{error || "Not found"}</p>;

  return (
    <div>
      <div className="mb-4">
        <Link to={`${base}/classes`} className="text-blue-600 hover:underline">
          ← Back to classes
        </Link>
      </div>
      <h2 className="text-lg font-semibold">{cls.name}</h2>
      {cls.description && <p className="text-gray-600 mt-1">{cls.description}</p>}
      <p className="text-sm text-gray-500 mt-2">Members: {cls.member_count}</p>
      {base === "/admin" && (
        <div className="mt-2">
          <label className="text-sm font-medium text-gray-700 mr-2">Teacher:</label>
          <select
            value={cls.created_by}
            onChange={handleChangeTeacher}
            disabled={updatingTeacher}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            {teachers.length === 0 && <option value={cls.created_by}>—</option>}
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name} ({t.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Invite code:</span>
        <code className="px-2 py-1 bg-white border rounded">{cls.invite_code}</code>
        <button
          type="button"
          onClick={copyCode}
          className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
        <button
          type="button"
          onClick={copyInviteLink}
          className="px-2 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200"
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
      </div>

      <h3 className="mt-6 font-medium">Members</h3>
      <ul className="mt-2 space-y-2">
        {members.length === 0 ? (
          <li className="text-gray-500">No members yet.</li>
        ) : (
          members.map((m) => (
            <li key={m.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
              <span>
                {m.user?.full_name ?? "—"} ({m.user?.email ?? ""})
              </span>
              <button
                type="button"
                onClick={() => handleRemove(m.user_id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
