import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getTeacherAntiCheatMonitor,
  type AntiCheatMonitorResponse,
  type AntiCheatMonitorRow,
} from "@/services/antiCheat.service";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/Icons";
import { FilterChips } from "@/components/features/admin/filter-chips";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeVietnam } from "@/utils/date";
import { t, useLanguage } from "@/i18n";

type Filter = "all" | "suspicious";

export function TeacherAntiCheatingPage() {
  const { token } = useAuth();
  const lang = useLanguage();
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
      setError(e instanceof Error ? e.message : t("antiCheat.loadFailed", lang));
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

  const stats = useMemo(() => {
    const s = data?.summary;
    return {
      total: s?.total_students ?? 0,
      active: s?.active_now ?? 0,
      suspicious: s?.suspicious ?? 0,
      submitted: s?.submitted ?? 0,
    };
  }, [data?.summary]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Icons.Shield className="size-6 text-primary" />
            {t("antiCheat.title", lang)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("antiCheat.subtitle", lang)}
          </p>
        </div>
        <Button variant="secondary" disabled={loading} onClick={() => fetchData(filter)}>
          <Icons.RefreshCw className="size-4" />
          {t("common.refresh", lang)}
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icons.User className="size-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{t("antiCheat.totalStudents", lang)}</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icons.Monitor className="size-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.active}</div>
              <div className="text-xs text-muted-foreground">{t("antiCheat.activeNow", lang)}</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Icons.AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.suspicious}</div>
              <div className="text-xs text-muted-foreground">{t("antiCheat.suspicious", lang)}</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Icons.CheckCircle className="size-5 text-info" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.submitted}</div>
              <div className="text-xs text-muted-foreground">{t("antiCheat.submitted", lang)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="search-input w-full sm:w-80">
            <Icons.Search className="size-4" />
            <input
              type="text"
              className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
              placeholder={t("antiCheat.searchPlaceholder", lang)}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <FilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: t("antiCheat.allStudents", lang) },
              { value: "suspicious", label: t("antiCheat.suspiciousOnly", lang) },
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
          <div className="py-10 text-center text-sm text-muted-foreground">{t("antiCheat.noStudents", lang)}</div>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("antiCheat.student", lang)}</TableHead>
                  <TableHead>{t("antiCheat.examClass", lang)}</TableHead>
                  <TableHead>{t("common.status", lang)}</TableHead>
                  <TableHead>{t("antiCheat.events", lang)}</TableHead>
                  <TableHead>{t("antiCheat.lastEvent", lang)}</TableHead>
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
                          <Badge variant="default">{t("common.status.active", lang)}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("antiCheat.submitted", lang)}</Badge>
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
                          {r.suspicious ? <Badge variant="outline">{t("antiCheat.suspicious", lang)}</Badge> : null}
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

