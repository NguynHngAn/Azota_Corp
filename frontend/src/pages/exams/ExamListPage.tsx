import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { listExams, type ExamResponse } from "../../api/exams";

export function ExamListPage() {
  const { token } = useAuth();
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listExams(token)
      .then(setExams)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Exams</h2>
        <Link
          to="/teacher/exams/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create exam
        </Link>
      </div>
      <ul className="space-y-2">
        {exams.length === 0 ? (
          <li className="text-gray-500">No exams yet.</li>
        ) : (
          exams.map((e) => (
            <li key={e.id}>
              <Link
                to={`/teacher/exams/${e.id}`}
                className="block p-3 bg-white rounded shadow hover:bg-gray-50 justify-between items-center"
              >
                <span className="font-medium">{e.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${e.is_draft ? "bg-yellow-100" : "bg-green-100"}`}
                >
                  {e.is_draft ? "Draft" : "Published"}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
