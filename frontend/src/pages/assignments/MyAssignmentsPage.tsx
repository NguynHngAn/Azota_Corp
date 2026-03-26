import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listMyAssignments, type AssignmentDetail } from "@/services/assignments.service";
import { formatDateTimeVietnam } from "@/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getStatus(a: AssignmentDetail): { label: string; variant: "default" | "secondary" | "outline" } {
  const now = new Date();
  const start = new Date(a.start_time);
  const end = new Date(a.end_time);
  if (now < start) return { label: "Upcoming", variant: "outline" };
  if (now <= end) return { label: "Open", variant: "default" };
  return { label: "Closed", variant: "secondary" };
}

export function MyAssignmentsPage() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listMyAssignments(token)
      .then(setAssignments)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Assigned exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">Exams that have been assigned to your classes.</p>
        </div>
      </div>
      {assignments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No assigned exams. Join a class to see assignments.
          </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => {
            const status = getStatus(a);
            return (
              <Card key={a.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium text-gray-900">{a.exam_title}</span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <span className="text-gray-500 text-sm">· {a.class_name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDateTimeVietnam(a.start_time)} – {formatDateTimeVietnam(a.end_time)} ·{" "}
                    {a.duration_minutes} min
                  </div>
                </div>
                {status.label === "Open" && (
                  <Button>
                    <Link to={`/student/assignments/${a.id}/exam`} className="text-white">
                      Enter exam
                    </Link>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
