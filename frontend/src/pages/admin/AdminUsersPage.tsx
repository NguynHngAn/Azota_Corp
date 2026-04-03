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
import { t, useLanguage } from "@/i18n";

export function AdminUsersPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  function formatMessage(key: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
      t(key as never, lang),
    );
  }

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
      .catch((e) => setError(e instanceof Error ? e.message : t("adminUsers.loadFailed", lang)))
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
      setNotice(t("adminUsers.createSuccess", lang));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("adminUsers.createFailed", lang));
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
      setNotice(t("adminUsers.updateStatusSuccess", lang));
    } catch {
      setNotice(t("adminUsers.updateStatusFailed", lang));
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
      setNotice(t("adminUsers.updateSuccess", lang));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : t("adminUsers.updateFailed", lang));
    } finally {
      setSavingEdit(false);
    }
  }

  async function savePassword() {
    if (!token || !passwordUser) return;
    setNotice("");
    if (!newPassword || newPassword.length < 6) {
      setNotice(t("adminUsers.passwordMinLength", lang));
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice(t("adminUsers.passwordMismatch", lang));
      return;
    }
    setSavingPassword(true);
    try {
      await resetUserPassword(passwordUser.id, newPassword, token);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      setNotice(t("adminUsers.passwordResetSuccess", lang));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : t("adminUsers.passwordResetFailed", lang));
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
      setNotice(t("adminUsers.deleteSuccess", lang));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : t("adminUsers.deleteFailed", lang));
    }
  }

  if (loading) return <p className="text-muted-foreground">{t("adminUsers.loading", lang)}</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("adminUsers.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("adminUsers.subtitle", lang)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>{t("adminUsers.createUser", lang)}</Button>
        </div>
      </div>
      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-destructive" : "text-primary"}`}>
          {notice}
        </p>
      )}

      <DataTableLayout
        title={t("adminUsers.managementTitle", lang)}
        loading={false}
        error=""
        isEmpty={filteredUsers.length === 0}
        emptyMessage={t("adminUsers.empty", lang)}
        controls={
          <>
            <div className="w-full sm:w-72">
              <Input
                placeholder={t("adminUsers.searchPlaceholder", lang)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <FilterChips
              value={filterRole}
              onChange={setFilterRole}
              options={[
                { value: "all", label: t("common.all", lang) },
                { value: "teacher", label: t("role.teacher", lang) },
                { value: "student", label: t("role.student", lang) },
              ]}
            />
          </>
        }
      >
        <Table>
          <TableCaption>{t("adminUsers.totalUsers", lang)}: {users.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name", lang)}</TableHead>
              <TableHead>{t("common.email", lang)}</TableHead>
              <TableHead>{t("common.roleLabel", lang)}</TableHead>
              <TableHead>{t("common.status", lang)}</TableHead>
              <TableHead className="text-right">{t("common.actions", lang)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  {t("adminUsers.empty", lang)}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="default">{t(`role.${u.role}` as never, lang)}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_active ? (
                      <Badge variant="secondary">{t("common.status.active", lang)}</Badge>
                    ) : (
                      <Badge variant="destructive">{t("common.status.inactive", lang)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button size="sm" variant="ghost" type="button" onClick={() => openEdit(u)}>
                        {t("common.edit", lang)}
                      </Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => setPasswordUser(u)}>
                        {t("adminUsers.resetPassword", lang)}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          const msg = u.is_active
                            ? formatMessage("adminUsers.deactivateConfirm", { name: u.full_name, email: u.email })
                            : formatMessage("adminUsers.activateConfirm", { name: u.full_name, email: u.email });
                          if (window.confirm(msg)) void applyToggleActive(u);
                        }}
                      >
                        {u.is_active ? t("adminUsers.deactivate", lang) : t("adminUsers.activate", lang)}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(formatMessage("adminUsers.deleteConfirm", { name: u.full_name, email: u.email }))
                          ) {
                            void applyDelete(u);
                          }
                        }}
                      >
                        {t("common.delete", lang)}
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
            <DialogTitle>{t("adminUsers.createDialogTitle", lang)}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">{t("settings.profile.fullName", lang)} *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("adminUsers.fullNamePlaceholder", lang)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">{t("common.email", lang)} *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.emailPlaceholder", lang)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">{t("adminUsers.newPassword", lang)} *</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              <p className="mt-1 text-[11px] text-muted-foreground">{t("adminUsers.passwordHint", lang)}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">{t("common.roleLabel", lang)} *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "teacher" | "student")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="teacher">{t("role.teacher", lang)}</option>
                <option value="student">{t("role.student", lang)}</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? t("adminUsers.creating", lang) : t("adminUsers.createAccount", lang)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !savingEdit && !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminUsers.editDialogTitle", lang)}</DialogTitle>
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
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("common.email", lang)}</label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("settings.profile.fullName", lang)}</label>
                  <Input value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("common.roleLabel", lang)}</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "teacher" | "student")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="teacher">{t("role.teacher", lang)}</option>
                    <option value="student">{t("role.student", lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("common.status", lang)}</label>
                  <select
                    value={editIsActive ? "active" : "inactive"}
                    onChange={(e) => setEditIsActive(e.target.value === "active")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="active">{t("common.status.active", lang)}</option>
                    <option value="inactive">{t("common.status.inactive", lang)}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" type="button" onClick={() => setEditingUser(null)} disabled={savingEdit}>
                  {t("common.cancel", lang)}
                </Button>
                <Button type="button" disabled={savingEdit} onClick={saveEdit}>
                  {savingEdit ? t("common.saving", lang) : t("common.save", lang)}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!passwordUser} onOpenChange={(open) => !savingPassword && !open && setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminUsers.passwordDialogTitle", lang)}</DialogTitle>
          </DialogHeader>
          {passwordUser && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {formatMessage("adminUsers.passwordDialogDescription", { email: passwordUser.email })}
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
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("adminUsers.newPassword", lang)}</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    placeholder={t("settings.security.minimumLength", lang)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">{t("adminUsers.confirmNewPassword", lang)}</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    placeholder={t("settings.security.confirmPassword", lang)}
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
                  {t("common.cancel", lang)}
                </Button>
                <Button type="button" disabled={savingPassword} onClick={savePassword}>
                  {savingPassword ? t("common.saving", lang) : t("settings.security.updatePassword", lang)}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

