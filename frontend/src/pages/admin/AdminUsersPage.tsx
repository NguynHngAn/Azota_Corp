import { useCallback, useEffect, useId, useMemo, useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { DataTableLayout } from "@/components/features/admin/data-table-layout";
import { t, useLanguage } from "@/i18n";
import { Icons } from "@/components/layouts/Icons";
import { cn } from "@/lib/utils";

type PageNotice = { kind: "success" | "error"; message: string };

export function AdminUsersPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const createNameId = `${useId()}-fullName`;
  const createEmailId = `${useId()}-email`;
  const createPasswordId = `${useId()}-password`;
  const createRoleId = `${useId()}-role`;

  function formatMessage(key: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
      t(key as never, lang),
    );
  }

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filterRole, setFilterRole] = useState<"teacher" | "student" | "all">("all");
  const [query, setQuery] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<"teacher" | "student">("teacher");
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const editEmailId = `${useId()}-edit-email`;
  const editNameId = `${useId()}-edit-name`;
  const editRoleId = `${useId()}-edit-role`;
  const editStatusId = `${useId()}-edit-status`;

  const [passwordUser, setPasswordUser] = useState<UserResponse | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const pwdNewId = `${useId()}-pwd-new`;
  const pwdConfirmId = `${useId()}-pwd-confirm`;

  const [notice, setNotice] = useState<PageNotice | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setListLoading(false);
      setUsers([]);
      setLoadError("");
      return;
    }
    setListLoading(true);
    setLoadError("");
    try {
      const roleParam = filterRole === "all" ? undefined : filterRole;
      const rows = await listUsers(token, roleParam);
      setUsers(rows.filter((u) => u.role !== "admin"));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t("adminUsers.loadFailed", lang));
    } finally {
      setListLoading(false);
    }
  }, [token, filterRole, lang]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q));
  }, [users, query]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setNotice(null);
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
      setNotice({ kind: "success", message: t("adminUsers.createSuccess", lang) });
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : t("adminUsers.createFailed", lang),
      });
    } finally {
      setCreating(false);
    }
  }

  async function applyToggleActive(user: UserResponse) {
    if (!token) return;
    setNotice(null);
    try {
      if (user.is_active) {
        await deactivateUser(user.id, token);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)));
      } else {
        const updated = await updateUser(user.id, { is_active: true }, token);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      }
      setNotice({ kind: "success", message: t("adminUsers.updateStatusSuccess", lang) });
    } catch {
      setNotice({ kind: "error", message: t("adminUsers.updateStatusFailed", lang) });
    }
  }

  function openEdit(u: UserResponse) {
    setEditingUser(u);
    setEditEmail(u.email);
    setEditFullName(u.full_name);
    setEditRole(u.role === "teacher" ? "teacher" : "student");
    setEditIsActive(u.is_active);
    setNotice(null);
  }

  async function saveEdit() {
    if (!token || !editingUser) return;
    setSavingEdit(true);
    setNotice(null);
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
      setNotice({ kind: "success", message: t("adminUsers.updateSuccess", lang) });
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : t("adminUsers.updateFailed", lang),
      });
    } finally {
      setSavingEdit(false);
    }
  }

  async function savePassword() {
    if (!token || !passwordUser) return;
    setNotice(null);
    if (!newPassword || newPassword.length < 6) {
      setNotice({ kind: "error", message: t("adminUsers.passwordMinLength", lang) });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ kind: "error", message: t("adminUsers.passwordMismatch", lang) });
      return;
    }
    setSavingPassword(true);
    try {
      await resetUserPassword(passwordUser.id, newPassword, token);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ kind: "success", message: t("adminUsers.passwordResetSuccess", lang) });
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : t("adminUsers.passwordResetFailed", lang),
      });
    } finally {
      setSavingPassword(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">{t("adminUsers.notSignedIn", lang)}</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("adminUsers.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("adminUsers.subtitle", lang)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={() => setCreateOpen(true)} className="gap-1.5 rounded-lg">
            <Icons.UserPlus className="size-4" />
            {t("adminUsers.createUser", lang)}
          </Button>
        </div>
      </div>
      {notice && (
        <div
          className={cn(
            "text-sm rounded-xl px-3 py-2 border",
            notice.kind === "error"
              ? "text-destructive bg-destructive/10 border-destructive/20"
              : "text-primary bg-primary/10 border-primary/20",
          )}
        >
          {notice.message}
        </div>
      )}

      <DataTableLayout
        title={t("adminUsers.managementTitle", lang)}
        loading={listLoading}
        error={loadError}
        onRetry={loadError ? () => void fetchUsers() : undefined}
        retryLabel={loadError ? t("common.retry", lang) : undefined}
        isEmpty={!listLoading && !loadError && filteredUsers.length === 0}
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
          <TableCaption>
            {t("adminUsers.totalUsers", lang)}: {users.length}
          </TableCaption>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setNotice(null);
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordUser(u);
                        }}
                      >
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
            <DialogDescription>{t("adminUsers.createDialogDescription", lang)}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor={createNameId} className="mb-1 block text-xs font-medium text-foreground">
                {t("settings.profile.fullName", lang)} *
              </label>
              <Input
                id={createNameId}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("adminUsers.fullNamePlaceholder", lang)}
                required
              />
            </div>
            <div>
              <label htmlFor={createEmailId} className="mb-1 block text-xs font-medium text-foreground">
                {t("common.email", lang)} *
              </label>
              <Input
                id={createEmailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder", lang)}
                required
              />
            </div>
            <div>
              <label htmlFor={createPasswordId} className="mb-1 block text-xs font-medium text-foreground">
                {t("adminUsers.newPassword", lang)} *
              </label>
              <Input
                id={createPasswordId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{t("adminUsers.passwordHint", lang)}</p>
            </div>
            <div>
              <label htmlFor={createRoleId} className="mb-1 block text-xs font-medium text-foreground">
                {t("common.roleLabel", lang)} *
              </label>
              <select
                id={createRoleId}
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
            <DialogDescription>{t("adminUsers.editDialogDescription", lang)}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor={editEmailId} className="mb-1 block text-xs font-medium text-foreground">
                    {t("common.email", lang)}
                  </label>
                  <Input id={editEmailId} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={editNameId} className="mb-1 block text-xs font-medium text-foreground">
                    {t("settings.profile.fullName", lang)}
                  </label>
                  <Input id={editNameId} value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor={editRoleId} className="mb-1 block text-xs font-medium text-foreground">
                    {t("common.roleLabel", lang)}
                  </label>
                  <select
                    id={editRoleId}
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as "teacher" | "student")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="teacher">{t("role.teacher", lang)}</option>
                    <option value="student">{t("role.student", lang)}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={editStatusId} className="mb-1 block text-xs font-medium text-foreground">
                    {t("common.status", lang)}
                  </label>
                  <select
                    id={editStatusId}
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
                <Button type="button" disabled={savingEdit} onClick={() => void saveEdit()}>
                  {savingEdit ? t("common.saving", lang) : t("common.save", lang)}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!passwordUser}
        onOpenChange={(open) => {
          if (!open && !savingPassword) {
            setPasswordUser(null);
            setNewPassword("");
            setConfirmPassword("");
            setNotice(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminUsers.passwordDialogTitle", lang)}</DialogTitle>
            <DialogDescription>
              {passwordUser
                ? formatMessage("adminUsers.passwordDialogDescription", { email: passwordUser.email })
                : null}
            </DialogDescription>
          </DialogHeader>
          {passwordUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label htmlFor={pwdNewId} className="mb-1 block text-xs font-medium text-foreground">
                    {t("adminUsers.newPassword", lang)}
                  </label>
                  <Input
                    id={pwdNewId}
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    placeholder={t("settings.security.minimumLength", lang)}
                  />
                </div>
                <div>
                  <label htmlFor={pwdConfirmId} className="mb-1 block text-xs font-medium text-foreground">
                    {t("adminUsers.confirmNewPassword", lang)}
                  </label>
                  <Input
                    id={pwdConfirmId}
                    type="password"
                    autoComplete="new-password"
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
                    setNotice(null);
                  }}
                >
                  {t("common.cancel", lang)}
                </Button>
                <Button type="button" disabled={savingPassword} onClick={() => void savePassword()}>
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
