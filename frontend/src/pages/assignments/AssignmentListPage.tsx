import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listAssignments, type AssignmentDetail } from "../../api/assignments";
import { formatDateTimeVietnam } from "../../utils/date";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function AssignmentListPage() {
  const { token } = useAuth();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listAssignments(token)
      .then(setAssignments)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Assignments</h2>
        <Link
          to={`${base}/assignments/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Assign exam
        </Link>
      </div>
      <ul className="space-y-2">
        {assignments.length === 0 ? (
          <li className="text-gray-500">No assignments yet. Assign an exam to a class to get started.</li>
        ) : (
          assignments.map((a) => (
            <li key={a.id}>
              <div className="p-3 bg-white rounded shadow hover:bg-gray-50 flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{a.exam_title}</span>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">{a.class_name}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDateTimeVietnam(a.start_time)} – {formatDateTimeVietnam(a.end_time)} · {a.duration_minutes} min
                  </div>
                </div>
                {base === "/teacher" && (
                  <Link
                    to={`/teacher/assignments/${a.id}/report`}
                    className="shrink-0 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    View report
                  </Link>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
