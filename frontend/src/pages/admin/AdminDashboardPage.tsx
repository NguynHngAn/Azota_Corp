import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { listUsers, createUser, type UserResponse } from "@/services/users.service";
import { listExams } from "@/services/exams.service";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/layouts/StatCard";
import { Input } from "@/components/ui/input";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/Icons";
import { DataTableLayout } from "@/components/features/admin/data-table-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t, useLanguage, useTimezone } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatLocaleDate } from "@/utils/date";

type Filter = "all" | "teacher" | "student";

type PageNotice = { kind: "success" | "error"; message: string };

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" | "destructive" {
  if (role === "teacher") return "default";
  if (role === "student") return "secondary";
  if (role === "admin") return "destructive";
  return "outline";
}

export function AdminDashboardPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const tz = useTimezone();
  const createNameId = `${useId()}-fullName`;
  const createEmailId = `${useId()}-email`;
  const createPasswordId = `${useId()}-password`;
  const createRoleId = `${useId()}-role`;

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [examCount, setExamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<PageNotice | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setUsers([]);
      setExamCount(0);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userRows = await listUsers(token);
      setUsers(userRows.filter((u) => u.role !== "admin"));
      try {
        const exams = await listExams(token);
        setExamCount(exams.length);
      } catch {
        setExamCount(0);
      }
    } catch (e) {
      setUsers([]);
      setExamCount(0);
      setError(e instanceof Error ? e.message : t("adminDashboard.failed", lang));
    } finally {
      setLoading(false);
    }
  }, [token, lang]);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const stats = useMemo(() => {
    const total = users.length;
    const teachers = users.filter((u) => u.role === "teacher").length;
    const students = users.filter((u) => u.role === "student").length;
    return { total, teachers, students };
  }, [users]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== "all" && u.role !== filter) return false;
      if (!query) return true;
      return u.email.toLowerCase().includes(query) || u.full_name.toLowerCase().includes(query);
    });
  }, [users, q, filter]);

  async function handleCreate() {
    if (!token) return;
    setNotice(null);
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setNotice({ kind: "error", message: t("adminDashboard.validation", lang) });
      return;
    }
    setCreating(true);
    try {
      const created = await createUser(
        { full_name: fullName.trim(), email: email.trim(), password, role, is_active: true },
        token,
      );
      setUsers((prev) => [...prev, created]);
      setCreateOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("teacher");
      setNotice({ kind: "success", message: t("adminUsers.createSuccess", lang) });
    } catch (e) {
      setNotice({
        kind: "error",
        message: e instanceof Error ? e.message : t("adminDashboard.createFailed", lang),
      });
    } finally {
      setCreating(false);
    }
  }

  if (!token) {
    return <p className="text-sm text-muted-foreground">{t("adminUsers.notSignedIn", lang)}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("adminDashboard.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("adminDashboard.subtitle", lang)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            className="gap-1.5 rounded-lg"
            onClick={() => {
              setNotice(null);
              setCreateOpen(true);
            }}
          >
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Icons.Users className="size-5" />}
          value={String(stats.total)}
          title={t("adminDashboard.totalUsers", lang)}
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.GraduationCap className="size-5" />}
          value={String(stats.teachers)}
          title={t("role.teacher", lang)}
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.Users className="size-5" />}
          value={String(stats.students)}
          title={t("role.student", lang)}
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.FileText className="size-5" />}
          value={String(examCount)}
          title={t("adminDashboard.totalExams", lang)}
          change="--"
          trend="up"
        />
      </div>

      <DataTableLayout
        title={t("adminUsers.managementTitle", lang)}
        loading={loading}
        error={error}
        onRetry={error ? () => void fetchDashboard() : undefined}
        retryLabel={error ? t("common.retry", lang) : undefined}
        isEmpty={!loading && !error && filtered.length === 0}
        emptyMessage={t("adminUsers.empty", lang)}
        controls={
          <>
            <div className="w-full sm:w-72">
              <Input
                placeholder={t("adminUsers.searchPlaceholder", lang)}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <FilterChips
              value={filter}
              onChange={(v) => setFilter(v as Filter)}
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
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name", lang)}</TableHead>
              <TableHead>{t("common.roleLabel", lang)}</TableHead>
              <TableHead>{t("adminDashboard.joined", lang)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                      {(u.full_name || u.email)[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{u.full_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(u.role)}>{t(`role.${u.role}` as never, lang)}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatLocaleDate(u.created_at, lang, tz)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableLayout>

      <div className="text-center">
        <Link
          to="/admin/users"
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          {t("adminDashboard.viewAllUsers", lang)}
        </Link>
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!creating) {
            setCreateOpen(open);
            if (!open) setNotice(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminUsers.createDialogTitle", lang)}</DialogTitle>
            <DialogDescription>{t("adminUsers.createDialogDescription", lang)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor={createNameId} className="mb-1 block text-xs font-medium text-foreground">
                {t("settings.profile.fullName", lang)} *
              </label>
              <Input
                id={createNameId}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("adminUsers.fullNamePlaceholder", lang)}
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
              />
            </div>
            <div>
              <label htmlFor={createPasswordId} className="mb-1 block text-xs font-medium text-foreground">
                {t("login.password", lang)} *
              </label>
              <Input
                id={createPasswordId}
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("adminUsers.passwordHint", lang)}
              />
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
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" className="w-full" disabled={creating} onClick={() => void handleCreate()}>
              {creating ? t("adminUsers.creating", lang) : t("adminUsers.createAccount", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
