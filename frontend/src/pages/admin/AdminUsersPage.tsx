import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  resetUserPassword,
  type UserResponse,
} from "@/services/users.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { DataTableLayout } from "@/components/features/admin/data-table-layout";

export function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState < UserResponse[] > ([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState < "teacher" | "student" | "all" > ("all");
  const [query, setQuery] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState < "teacher" | "student" > ("teacher");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [editingUser, setEditingUser] = useState < UserResponse | null > (null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState < "teacher" | "student" > ("teacher");
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [passwordUser, setPasswordUser] = useState < UserResponse | null > (null);
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

  if (loading) return <p className="text-muted-foreground">Loading users...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage accounts, roles and access.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>Create User</Button>
        </div>
      </div>
      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-destructive" : "text-primary"}`}>
          {notice}
        </p>
      )}

      <DataTableLayout
        title="User Management"
        loading={false}
        error=""
        isEmpty={filteredUsers.length === 0}
        emptyMessage="No users found."
        controls={
          <>
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
          </>
        }
      >
        <Table>
          <TableCaption>Total users: {users.length}</TableCaption>
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
                <TableCell colSpan={5} className="text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="default">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_active ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
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
                          const msg = u.is_active
                            ? `Are you sure you want to deactivate ${u.full_name} (${u.email})?`
                            : `Are you sure you want to activate ${u.full_name} (${u.email})?`;
                          if (window.confirm(msg)) void applyToggleActive(u);
                        }}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `This will deactivate ${u.full_name} (${u.email}). The user will not be able to login.`,
                            )
                          ) {
                            void applyDelete(u);
                          }
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
        </Table>
      </DataTableLayout>

      <Dialog open={createOpen} onOpenChange={(open) => !creating && setCreateOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Full Name *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Email *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Password *</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              <p className="mt-1 text-[11px] text-muted-foreground">Min 6 characters</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "teacher" | "student")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !savingEdit && !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              {notice && notice.toLowerCase().includes("fail") && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {notice}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">Email</label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">Full name</label>
                  <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "teacher" | "student")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Status</label>
                  <select
                    value={editIsActive ? "active" : "inactive"}
                    onChange={(e) => setEditIsActive(e.target.value === "active")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" type="button" onClick={() => setEditingUser(null)} disabled={savingEdit}>
                  Cancel
                </Button>
                <Button type="button" disabled={savingEdit} onClick={saveEdit}>
                  {savingEdit ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!passwordUser} onOpenChange={(open) => !savingPassword && !open && setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
          </DialogHeader>
          {passwordUser && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Set a new password for <span className="font-medium text-foreground">{passwordUser.email}</span>.
              </div>
              {notice && (
                <div
                  className={`text-sm rounded-xl px-3 py-2 border ${notice.toLowerCase().includes("fail") || notice.toLowerCase().includes("must") || notice.toLowerCase().includes("match")
                      ? "text-destructive bg-destructive/10 border-destructive/20"
                      : "text-primary bg-primary/10 border-primary/20"
                    }`}
                >
                  {notice}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">New password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Confirm new password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
              <DialogFooter>
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
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

