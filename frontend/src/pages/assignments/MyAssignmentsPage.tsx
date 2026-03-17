import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  listMyAssignments,
  type AssignmentDetail,
} from "../../api/assignments";
import { formatDateTimeVietnam } from "../../utils/date";

function getStatus(a: AssignmentDetail): { label: string; className: string } {
  const now = new Date();
  const start = new Date(a.start_time);
  const end = new Date(a.end_time);
  if (now < start)
    return { label: "Upcoming", className: "bg-slate-100 text-slate-700" };
  if (now <= end)
    return { label: "Open", className: "bg-green-100 text-green-800" };
  return { label: "Closed", className: "bg-gray-100 text-gray-600" };
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
    <div>
      <h2 className="text-lg font-semibold mb-4">Assigned exams</h2>
      <ul className="space-y-2">
        {assignments.length === 0 ? (
          <li className="text-gray-500">
            No assigned exams. Join a class to see assignments.
          </li>
        ) : (
          assignments.map((a) => {
            const status = getStatus(a);
            return (
              <li key={a.id}>
                <div className="p-3 bg-white rounded shadow hover:bg-gray-50 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium">{a.exam_title}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded shrink-0 ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      · {a.class_name}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDateTimeVietnam(a.start_time)} –{" "}
                      {formatDateTimeVietnam(a.end_time)} · {a.duration_minutes}{" "}
                      min
                    </div>
                  </div>
                  {status.label === "Open" && (
                    <Link
                      to={`/student/assignments/${a.id}/exam`}
                      className="shrink-0 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Enter exam
                    </Link>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
