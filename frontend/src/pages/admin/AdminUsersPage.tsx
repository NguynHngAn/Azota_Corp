import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  type UserResponse,
} from "../../api/users";

export function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState<"teacher" | "student" | "all">("all");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    const roleParam = filterRole === "all" ? undefined : filterRole;
    setLoading(true);
    listUsers(token, roleParam)
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, [token, filterRole]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError("");
    try {
      const created = await createUser(
        { email, full_name: fullName, password, role, is_active: true },
        token,
      );
      setUsers((prev) => [...prev, created]);
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("teacher");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(user: UserResponse) {
    if (!token) return;
    try {
      if (user.is_active) {
        await deactivateUser(user.id, token);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)));
      } else {
        const updated = await updateUser(user.id, { is_active: true }, token);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      }
    } catch {}
  }

  if (loading) return <p className="text-gray-600">Loading users...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Users</h2>

      <form onSubmit={handleCreate} className="p-4 bg-white rounded shadow space-y-3 max-w-xl">
        <h3 className="text-sm font-semibold text-gray-800">Create user</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "teacher" | "student")}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </form>

      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Existing users</h3>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as "teacher" | "student" | "all")}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-1">Name</th>
              <th className="py-1">Email</th>
              <th className="py-1">Role</th>
              <th className="py-1">Status</th>
              <th className="py-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-2 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-1">{u.full_name}</td>
                  <td className="py-1">{u.email}</td>
                  <td className="py-1 capitalize">{u.role}</td>
                  <td className="py-1">
                    {u.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">Inactive</span>
                    )}
                  </td>
                  <td className="py-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

