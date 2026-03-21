import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listMyAssignments, type AssignmentDetail } from "@/api/assignments";
import { formatDateTimeVietnam } from "@/utils/date";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getStatus(a: AssignmentDetail): { label: string; variant: "default" | "success" | "warning" } {
  const now = new Date();
  const start = new Date(a.start_time);
  const end = new Date(a.end_time);
  if (now < start) return { label: "Upcoming", variant: "default" };
  if (now <= end) return { label: "Open", variant: "success" };
  return { label: "Closed", variant: "warning" };
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
      <PageHeader
        title="Assigned exams"
        description="Exams that have been assigned to your classes."
      />
      {assignments.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">
            No assigned exams. Join a class to see assignments.
          </p>
        </Card>
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
