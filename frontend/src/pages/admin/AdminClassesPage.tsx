import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createClass, listClasses, type ClassResponse } from "../../api/classes";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { AdminModal } from "../../components/admin/AdminModal";

export function AdminClassesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    listClasses(token)
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load classes"))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(query) || (c.description || "").toLowerCase().includes(query));
  }, [classes, q]);

  async function handleCreate() {
    if (!token) return;
    setNotice("");
    if (!name.trim()) {
      setNotice("Class name is required.");
      return;
    }
    setCreating(true);
    try {
      const created = await createClass({ name: name.trim(), description: description.trim() || null }, token);
      setClasses((prev) => [...prev, created]);
      setCreateOpen(false);
      setName("");
      setDescription("");
      setNotice("Class created successfully.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Failed to create class.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Classes</h1>
          <p className="text-sm text-slate-500">Manage classes, members, and teacher assignments.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New Class</Button>
      </div>

      {notice && (
        <p className={`text-sm ${notice.toLowerCase().includes("fail") ? "text-red-600" : "text-emerald-700"}`}>
          {notice}
        </p>
      )}

      <Card className="border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-96">
            <Input placeholder="Search classes..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">Loading...</div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No classes yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                    <TableCell className="text-slate-600">{c.description || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/classes/${c.id}`)}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <AdminModal
        open={createOpen}
        title="Create New Class"
        onClose={() => !creating && setCreateOpen(false)}
        footer={
          <Button className="w-full" disabled={creating} onClick={handleCreate}>
            {creating ? "Creating..." : "Create Class"}
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Class Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 10A" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." />
          </div>
          {notice && <p className="text-sm text-red-600">{notice}</p>}
        </div>
      </AdminModal>
    </div>
  );
}

