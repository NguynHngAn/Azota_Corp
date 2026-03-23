import { useEffect, useMemo, useRef, useState } from "react";
import {
  listMembers,
  listMyClasses,
  type ClassMemberResponse,
  type ClassResponse,
} from "@/services/classes.service";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeVietnam } from "@/utils/date";

// In-memory caches (persist across SPA navigation)
const membersCache = new Map<number, ClassMemberResponse[]>();
const membersInflight = new Map<number, Promise<ClassMemberResponse[]>>();

async function listMembersCached(classId: number, token: string): Promise<ClassMemberResponse[]> {
  const hit = membersCache.get(classId);
  if (hit) return hit;
  const inflight = membersInflight.get(classId);
  if (inflight) return inflight;
  const p = listMembers(classId, token)
    .then((res) => {
      membersCache.set(classId, res);
      return res;
    })
    .finally(() => {
      membersInflight.delete(classId);
    });
  membersInflight.set(classId, p);
  return p;
}

type StudentRow = {
  userId: number;
  fullName: string;
  email: string;
  classNames: string[];
  memberships: number;
  firstJoinedAt?: string;
};

export function TeacherStudentsPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [membersByClass, setMembersByClass] = useState<Record<number, ClassMemberResponse[]>>({});
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    listMyClasses(token)
      .then((res) => setClasses(res))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load classes"))
      .finally(() => setLoading(false));
  }, [token]);

  // Load class members progressively without spiking requests.
  useEffect(() => {
    if (!token) return;
    const runId = ++runIdRef.current;
    const anyWindow = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const idle = () =>
      new Promise<void>((resolve) => {
        if (anyWindow.requestIdleCallback) anyWindow.requestIdleCallback(() => resolve(), { timeout: 400 });
        else window.setTimeout(() => resolve(), 120);
      });

    setLoadingDetails(true);
    setMembersByClass({});

    const classIds = classes.map((c) => c.id);
    if (classIds.length === 0) {
      setLoadingDetails(false);
      return;
    }

    const batchSize = 4;
    (async () => {
      for (let i = 0; i < classIds.length; i += batchSize) {
        if (runIdRef.current !== runId) return;
        const batch = classIds.slice(i, i + batchSize);
        const results = await Promise.all(batch.map((id) => listMembersCached(id, token).catch(() => [] as ClassMemberResponse[])));
        if (runIdRef.current !== runId) return;
        setMembersByClass((prev) => {
          const next = { ...prev };
          batch.forEach((id, idx) => {
            next[id] = results[idx] ?? [];
          });
          return next;
        });
        await idle();
      }
      if (runIdRef.current === runId) setLoadingDetails(false);
    })();

    return () => {
      runIdRef.current++;
    };
  }, [classes, token]);

  const membershipCount = useMemo(() => {
    return Object.values(membersByClass).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  }, [membersByClass]);

  const students = useMemo<StudentRow[]>(() => {
    const byUser = new Map<number, StudentRow>();
    const classNameById = new Map<number, string>(classes.map((c) => [c.id, c.name]));

    for (const [classIdStr, members] of Object.entries(membersByClass)) {
      const classId = Number(classIdStr);
      const className = classNameById.get(classId) ?? `Class #${classId}`;
      for (const m of members ?? []) {
        const role = m.user?.role;
        if (role && role !== "student") continue;
        const userId = m.user?.id ?? m.user_id;
        const fullName = (m.user?.full_name ?? "").trim() || `Student #${userId}`;
        const email = (m.user?.email ?? "").trim();
        const prev = byUser.get(userId);
        if (!prev) {
          byUser.set(userId, {
            userId,
            fullName,
            email,
            classNames: [className],
            memberships: 1,
            firstJoinedAt: m.joined_at,
          });
          continue;
        }
        prev.memberships += 1;
        if (!prev.classNames.includes(className)) prev.classNames.push(className);
        if (!prev.firstJoinedAt || (m.joined_at && m.joined_at < prev.firstJoinedAt)) prev.firstJoinedAt = m.joined_at;
      }
    }

    const q = query.trim().toLowerCase();
    const list = Array.from(byUser.values())
      .map((s) => ({ ...s, classNames: [...s.classNames].sort((a, b) => a.localeCompare(b)) }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    if (!q) return list;
    return list.filter((s) => {
      const hay = `${s.fullName} ${s.email} ${s.classNames.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [classes, membersByClass, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={
          loading
            ? "Loading classes..."
            : `${membershipCount} student memberships across classes · ${students.length} unique students.`
        }
      />

      <Card className="border border-slate-100 shadow-sm">
        <div className="max-w-md">
          <Input
            placeholder="Search students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {error ? (
          <div className="py-12 text-center text-sm text-rose-600">{error}</div>
        ) : loading || loadingDetails ? (
          <div className="mt-4 space-y-3">
            <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">No students found.</div>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.userId}>
                    <TableCell className="min-w-0">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{s.fullName}</div>
                        <div className="text-xs text-slate-500 truncate">{s.email || "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-slate-50 text-slate-700 border border-slate-100">
                          {s.classNames.length} class{s.classNames.length === 1 ? "" : "es"}
                        </Badge>
                        <div className="text-xs text-slate-600">
                          {s.classNames.slice(0, 2).join(", ")}
                          {s.classNames.length > 2 ? ` +${s.classNames.length - 2}` : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {s.firstJoinedAt ? formatDateTimeVietnam(s.firstJoinedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

