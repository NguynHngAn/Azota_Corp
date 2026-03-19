import { useEffect, useMemo, useState } from "react";
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
import { AdminModal } from "../../components/admin/AdminModal";
import { FilterChips } from "../../components/admin/FilterChips";

export function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState<"teacher" | "student" | "all">("all");
  const [query, setQuery] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q));
  }, [users, query]);

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
      setCreateOpen(false);
      setNotice("User created successfully.");
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

  if (loading) return <p className="text-slate-500">Loading users...</p>;
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Manage accounts, roles and access.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create User</Button>
      </div>
      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-red-600" : "text-green-700"}`}>
          {notice}
        </p>
      )}

      <Card className="border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">User Management</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <FilterChips
              value={filterRole}
              onChange={setFilterRole}
              options={[
                { value: "all", label: "All" },
                { value: "teacher", label: "Teacher" },
                { value: "student", label: "Student" },
              ]}
            />
          </div>
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
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
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button size="sm" variant="ghost" type="button" onClick={() => openEdit(u)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => setPasswordUser(u)}>
                        Reset password
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setConfirmMode("toggleActive");
                          setConfirmUser(u);
                        }}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        type="button"
                        onClick={() => {
                          setConfirmMode("delete");
                          setConfirmUser(u);
                        }}
                      >
                        Delete
                      </Button>
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

      <AdminModal
        open={createOpen}
        title="Create New User"
        onClose={() => !creating && setCreateOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            <p className="mt-1 text-[11px] text-slate-400">Min 6 characters</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as "teacher" | "student")}>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </Select>
          </div>
          <Button type="submit" disabled={creating} className="w-full">
            {creating ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </AdminModal>

      <AdminModal
        open={!!editingUser}
        title="Edit user"
        onClose={() => !savingEdit && setEditingUser(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setEditingUser(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button type="button" disabled={savingEdit} onClick={saveEdit}>
              {savingEdit ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        {editingUser && (
          <div className="space-y-4">
            {notice && notice.toLowerCase().includes("fail") && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                {notice}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Full name</label>
                <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                <Select value={editRole} onChange={(e) => setEditRole(e.target.value as "teacher" | "student")}>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <Select
                  value={editIsActive ? "active" : "inactive"}
                  onChange={(e) => setEditIsActive(e.target.value === "active")}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={!!passwordUser}
        title="Reset password"
        onClose={() => !savingPassword && setPasswordUser(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              disabled={savingPassword}
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
        }
      >
        {passwordUser && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              Set a new password for <span className="font-medium text-slate-900">{passwordUser.email}</span>.
            </div>
            {notice && (
              <div
                className={`text-sm rounded-xl px-3 py-2 border ${
                  notice.toLowerCase().includes("fail") || notice.toLowerCase().includes("must") || notice.toLowerCase().includes("match")
                    ? "text-rose-700 bg-rose-50 border-rose-100"
                    : "text-emerald-800 bg-emerald-50 border-emerald-100"
                }`}
              >
                {notice}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirm new password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

