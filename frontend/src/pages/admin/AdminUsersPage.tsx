import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  resetUserPassword,
  type UserResponse,
} from "../../api/users";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "../../components/ui/Table";
import { ConfirmDialog } from "../../components/ui/Dialog";

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

  const [confirmUser, setConfirmUser] = useState<UserResponse | null>(null);
  const [confirmMode, setConfirmMode] = useState<"toggleActive" | "delete">("toggleActive");
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<"teacher" | "student">("teacher");
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [passwordUser, setPasswordUser] = useState<UserResponse | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState("");

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

  async function applyToggleActive(user: UserResponse) {
    if (!token) return;
    try {
      if (user.is_active) {
        await deactivateUser(user.id, token);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)));
      } else {
        const updated = await updateUser(user.id, { is_active: true }, token);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      }
      setNotice("Updated user status successfully.");
    } catch {
      setNotice("Failed to update user status.");
    }
  }

  function openEdit(u: UserResponse) {
    setEditingUser(u);
    setEditEmail(u.email);
    setEditFullName(u.full_name);
    setEditRole(u.role === "teacher" ? "teacher" : "student");
    setEditIsActive(u.is_active);
    setNotice("");
  }

  async function saveEdit() {
    if (!token || !editingUser) return;
    setSavingEdit(true);
    setNotice("");
    try {
      const updated = await updateUser(
        editingUser.id,
        {
          email: editEmail.trim(),
          full_name: editFullName.trim(),
          role: editRole,
          is_active: editIsActive,
        },
        token,
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      setNotice("User updated successfully.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to update user.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function savePassword() {
    if (!token || !passwordUser) return;
    setNotice("");
    if (!newPassword || newPassword.length < 6) {
      setNotice("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice("Password confirmation does not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await resetUserPassword(passwordUser.id, newPassword, token);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password reset successfully.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function applyDelete(user: UserResponse) {
    if (!token) return;
    setNotice("");
    try {
      await deactivateUser(user.id, token);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)));
      setNotice("User deleted (deactivated) successfully.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to delete user.");
    }
  }

  if (loading) return <p className="text-gray-600">Loading users...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const confirmOpen = !!confirmUser;
  const confirmTitle =
    confirmMode === "delete"
      ? "Delete user"
      : confirmUser?.is_active
        ? "Deactivate user"
        : "Activate user";
  const confirmDescription =
    confirmMode === "delete"
      ? confirmUser
        ? `This will deactivate ${confirmUser.full_name} (${confirmUser.email}). The user will not be able to login.`
        : ""
      : confirmUser
        ? confirmUser.is_active
          ? `Are you sure you want to deactivate ${confirmUser.full_name} (${confirmUser.email})?`
          : `Are you sure you want to activate ${confirmUser.full_name} (${confirmUser.email})?`
        : "";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Users</h2>
      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-red-600" : "text-green-700"}`}>
          {notice}
        </p>
      )}

      <Card className="max-w-xl space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Create user</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as "teacher" | "student")}
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Existing users</h3>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as "teacher" | "student" | "all")}
            className="w-auto"
          >
            <option value="all">All roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="text-xs text-slate-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasswordUser(u)}
                        className="text-xs text-indigo-700 hover:underline"
                      >
                        Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmMode("toggleActive");
                          setConfirmUser(u);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmMode("delete");
                          setConfirmUser(u);
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableCaption>Total users: {users.length}</TableCaption>
        </Table>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={
          confirmMode === "delete"
            ? "Delete"
            : confirmUser?.is_active
              ? "Deactivate"
              : "Activate"
        }
        onConfirm={() => {
          if (confirmUser) {
            if (confirmMode === "delete") applyDelete(confirmUser);
            else applyToggleActive(confirmUser);
          }
          setConfirmUser(null);
        }}
        onCancel={() => setConfirmUser(null)}
      />

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit user</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <Select value={editRole} onChange={(e) => setEditRole(e.target.value as "teacher" | "student")}>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <Select value={editIsActive ? "active" : "inactive"} onChange={(e) => setEditIsActive(e.target.value === "active")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="button" disabled={savingEdit} onClick={saveEdit}>
                {savingEdit ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {passwordUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-1">Reset password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set a new password for <span className="font-medium">{passwordUser.email}</span>.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm new password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setPasswordUser(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button type="button" disabled={savingPassword} onClick={savePassword}>
                {savingPassword ? "Saving..." : "Update password"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

