import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listExams, type ExamResponse } from "@/services/exams.service";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/icons";

export function ExamListPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  useEffect(() => {
    if (!token) return;
    listExams(token)
      .then(setExams)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return exams.filter((e) => {
      if (filter === "draft" && !e.is_draft) return false;
      if (filter === "published" && e.is_draft) return false;
      if (!query) return true;
      return e.title.toLowerCase().includes(query);
    });
  }, [exams, q, filter]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and create exams for your classes.</p>
        </div>
        <Button className="gap-1.5 rounded-lg" onClick={() => navigate("/teacher/exams/new")}>+ Create Exam</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="search-input flex-1 max-w-sm ">
          <Icons.Search className="w-4 h-4" />
          <input
            type="text"
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            placeholder="Search exams..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <FilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ]}
          />
      </div>
      <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No exams found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((e) => (
                <Link
                  key={e.id}
                  to={`/teacher/exams/${e.id}`}
                  className="block rounded-xl border border-border bg-card px-4 py-3 hover:bg-secondary/80 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-foreground">{e.title}</div>
                    <Badge variant={e.is_draft ? "outline" : "default"}>{e.is_draft ? "Draft" : "Published"}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </div>

    </div>
  );
}
