import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listClasses, type ClassResponse } from "@/services/classes.service";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/icons";

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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {base === "/admin" ? "Manage all classes in the system." : "Manage classes, members, and teacher assignments."}
          </p>
        </div>
        <Button onClick={() => navigate(`${base}/classes/new`)}><Icons.Plus className="size-4" /> New Class</Button>
      </div>

      <div >
        <div className="search-input max-w-md">
          <Icons.Search className="size-4" />
          <input
            type="text"
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            placeholder="Search classes..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No classes found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <Button
                  key={c.id}
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`${base}/classes/${c.id}`)}
                  className="h-auto w-full flex-col items-stretch rounded-2xl border-border bg-card px-4 py-4 text-left font-normal hover:bg-secondary"
                >
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  {c.description ? (
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</div>
                  ) : (
                    <div className="mt-1 text-sm text-muted-foreground">No description</div>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
