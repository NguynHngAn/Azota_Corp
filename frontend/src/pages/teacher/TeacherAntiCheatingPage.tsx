import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTeacherAntiCheatMonitor, type AntiCheatMonitorResponse, type AntiCheatMonitorRow } from "../../api/antiCheat";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { StatsCard } from "../../components/admin/StatsCard";
import { Icons } from "../../components/admin/icons";
import { Input } from "../../components/ui/Input";
import { FilterChips } from "../../components/admin/FilterChips";
import { Button } from "../../components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatDateTimeVietnam } from "../../utils/date";

type Filter = "all" | "suspicious";

export function TeacherAntiCheatingPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AntiCheatMonitorResponse | null>(null);

  const fetchData = async (nextFilter: Filter) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await getTeacherAntiCheatMonitor(token, {
        suspicious_only: nextFilter === "suspicious",
        lookback_minutes: 60 * 24,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load monitor");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, token]);

  const rows = useMemo(() => {
    const list = (data?.rows ?? []) as AntiCheatMonitorRow[];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const hay = `${r.full_name} ${r.email} ${r.class_name} ${r.exam_title}`.toLowerCase();
      return hay.includes(q);
    });
  }, [data, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Anti-Cheating Monitor</h1>
          <p className="text-sm text-slate-500">
            Event-based monitoring powered by anti-cheat logs.
          </p>
        </div>
        <Button variant="secondary" disabled={loading} onClick={() => fetchData(filter)}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={<Icons.Users />} value={data?.summary.total_students ?? (loading ? "—" : 0)} label="Total Students" tone="blue" />
        <StatsCard icon={<Icons.Chart />} value={data?.summary.active_now ?? (loading ? "—" : 0)} label="Active Now" tone="green" />
        <StatsCard icon={<Icons.Settings />} value={data?.summary.suspicious ?? (loading ? "—" : 0)} label="Suspicious" tone="amber" />
        <StatsCard icon={<Icons.Clipboard />} value={data?.summary.submitted ?? (loading ? "—" : 0)} label="Submitted" tone="slate" />
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-80">
            <Input placeholder="Search students..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <FilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All Students" },
              { value: "suspicious", label: "Suspicious Only" },
            ]}
          />
        </div>

        {error ? (
          <div className="py-10 text-center text-sm text-rose-600">{error}</div>
        ) : loading ? (
          <div className="mt-4 space-y-3">
            <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">No students found.</div>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam / Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Last event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const active = !r.submitted_at;
                  return (
                    <TableRow key={`${r.assignment_id}-${r.user_id}-${r.submission_id ?? "none"}`}>
                      <TableCell className="min-w-0">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{r.full_name || r.email || `#${r.user_id}`}</div>
                          <div className="text-xs text-slate-500 truncate">{r.email || "—"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{r.exam_title}</div>
                          <div className="text-xs text-slate-500 truncate">{r.class_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="default">Submitted</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={r.events_total >= 3 ? "danger" : r.events_total >= 1 ? "warning" : "default"}>
                            {r.events_total}
                          </Badge>
                          {r.suspicious && <span className="text-xs text-amber-700">Suspicious</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {r.last_event_at ? (
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-500">{r.last_event_type ?? "—"}</div>
                            <div>{formatDateTimeVietnam(r.last_event_at)}</div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

