import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { listClasses, type ClassResponse } from "../../api/classes";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function ClassListPage() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const base = basePath(location.pathname);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!token) return;
    listClasses(token)
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = classes.filter((c) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    return `${c.name} ${c.description || ""}`.toLowerCase().includes(query);
  });

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Classes</h1>
          <p className="text-sm text-slate-500">
            {base === "/admin" ? "Manage all classes in the system." : "Manage classes, members, and teacher assignments."}
          </p>
        </div>
        <Button onClick={() => navigate(`${base}/classes/new`)}>+ New Class</Button>
      </div>

      <Card className="shadow-sm hover:shadow-sm">
        <div className="max-w-md">
          <Input placeholder="Search classes..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No classes found.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`${base}/classes/${c.id}`)}
                  className="text-left rounded-2xl border border-slate-100 bg-white px-4 py-4 hover:bg-slate-50 transition"
                >
                  <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                  {c.description ? (
                    <div className="mt-1 text-sm text-slate-600 line-clamp-2">{c.description}</div>
                  ) : (
                    <div className="mt-1 text-sm text-slate-400">No description</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
