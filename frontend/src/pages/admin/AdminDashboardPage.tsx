import { useEffect, useMemo, useState } from "react";
import { listUsers, type UserResponse } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { StatsCard } from "../../components/admin/StatsCard";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { FilterChips } from "../../components/admin/FilterChips";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { AdminModal } from "../../components/admin/AdminModal";
import { createUser } from "../../api/users";
import { Select } from "../../components/ui/select";
import { Icons } from "../../components/admin/icons";

type Filter = "all" | "admin" | "teacher" | "student";

function roleBadgeVariant(role: string): "default" | "success" | "warning" | "danger" {
  if (role === "teacher") return "default";
  if (role === "student") return "success";
  if (role === "admin") return "danger";
  return "default";
}

export function AdminDashboardPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Create user modal
  const [createOpen, setCreateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    listUsers(token)
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, [token]);

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
    setNotice("");
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setNotice("Please enter full name, email and a password (min 6 chars).");
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
      setNotice("User created successfully.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed to create user.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Platform overview and user management.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create User</Button>
      </div>

      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-red-600" : "text-emerald-700"}`}>
          {notice}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={<Icons.Users />} value={stats.total} label="Total Users" tone="blue" />
        <StatsCard icon={<Icons.Book />} value={stats.teachers} label="Teachers" tone="violet" />
        <StatsCard icon={<Icons.Users />} value={stats.students} label="Students" tone="green" />
        <StatsCard icon={<Icons.Clipboard />} value={"—"} label="Total Exams" tone="slate" />
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">User Management</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name or email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <FilterChips
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "admin", label: "Admin" },
                { value: "teacher", label: "Teacher" },
                { value: "student", label: "Student" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-8">
              <div className="h-10 bg-slate-50 rounded-xl animate-pulse mb-3" />
              <div className="h-10 bg-slate-50 rounded-xl animate-pulse mb-3" />
              <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.slice(0, 8).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700">
                            {(u.full_name || u.email)[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{u.full_name}</div>
                            <div className="text-xs text-slate-500 truncate">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <AdminModal
        open={createOpen}
        title="Create New User"
        onClose={() => !creating && setCreateOpen(false)}
        footer={
          <Button className="w-full" disabled={creating} onClick={handleCreate}>
            {creating ? "Creating..." : "Create Account"}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role *</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as "teacher" | "student")}>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </Select>
          </div>
          {notice && <p className="text-sm text-red-600">{notice}</p>}
        </div>
      </AdminModal>
    </div>
  );
}

