import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getTeacherAntiCheatMonitor,
  type AntiCheatMonitorResponse,
  type AntiCheatMonitorRow,
} from "@/services/antiCheat.service";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/layouts/StatCard";
import { Icons } from "@/components/layouts/icons"; 
import { FilterChips } from "@/components/features/admin/filter-chips";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeVietnam } from "@/utils/date";

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anti-Cheating Monitor</h1>
          <p className="text-sm text-muted-foreground">
            Event-based monitoring powered by anti-cheat logs.
          </p>
        </div>
        <Button variant="secondary" disabled={loading} onClick={() => fetchData(filter)}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Icons.Users className="text-primary" />}
          value={String(data?.summary.total_students ?? (loading ? "—" : 0))}
          title="Total Students"
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.Chart className="text-success" />}
          value={String(data?.summary.active_now ?? (loading ? "—" : 0))}
          title="Active Now"
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.Settings className="text-warning" />}
          value={String(data?.summary.suspicious ?? (loading ? "—" : 0))}
          title="Suspicious"
          change="--"
          trend="up"
        />
        <StatCard
          icon={<Icons.CheckCircle className="text-info" />}
          value={String(data?.summary.submitted ?? (loading ? "—" : 0))}
          title="Submitted"
          change="--"
          trend="up"
        />
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="search-input w-full sm:w-80">
            <Icons.Search className="size-4" />
            <input
              type="text"
              className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
              placeholder="Search students..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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
          <div className="py-10 text-center text-sm text-destructive">{error}</div>
        ) : loading ? (
          <div className="mt-4 space-y-3">
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No students found.</div>
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
                          <div className="font-semibold text-foreground truncate">{r.full_name || r.email || `#${r.user_id}`}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.email || "—"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{r.exam_title}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.class_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Submitted</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              r.events_total >= 3 ? "destructive" : r.events_total >= 1 ? "outline" : "secondary"
                            }
                          >
                            {r.events_total}
                          </Badge>
                          {r.suspicious ? <Badge variant="outline">Suspicious</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.last_event_at ? (
                          <div className="space-y-0.5">
                            <div className="text-xs text-muted-foreground">{r.last_event_type ?? "—"}</div>
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
      </div>
    </div>
  );
}

