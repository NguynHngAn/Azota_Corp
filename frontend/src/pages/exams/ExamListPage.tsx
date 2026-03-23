import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listExams, type ExamResponse } from "@/services/exams.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { Badge } from "@/components/ui/badge";

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

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Exams</h1>
          <p className="text-sm text-slate-500">Manage and create exams for your classes.</p>
        </div>
        <Button onClick={() => navigate("/teacher/exams/new")}>+ Create Exam</Button>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-96">
            <Input placeholder="Search exams..." value={q} onChange={(e) => setQ(e.target.value)} />
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
            <div className="py-12 text-center text-sm text-slate-500">No exams found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((e) => (
                <Link
                  key={e.id}
                  to={`/teacher/exams/${e.id}`}
                  className="block rounded-xl border border-slate-100 bg-white px-4 py-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-900">{e.title}</div>
                    <Badge variant={e.is_draft ? "warning" : "success"}>{e.is_draft ? "Draft" : "Published"}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
