import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentReport, type AssignmentReportResponse } from "../../api/assignments";
import { ScoreBarChart } from "../../components/ScoreBarChart";

export function AssignmentReportPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [report, setReport] = useState<AssignmentReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    const assignmentId = parseInt(id, 10);
    if (Number.isNaN(assignmentId)) {
      setError("Invalid assignment");
      setLoading(false);
      return;
    }
    getAssignmentReport(assignmentId, token)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load report"))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <p className="text-gray-600">Loading report...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!report) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{report.exam_title}</h2>
        <p className="text-sm text-gray-600">Class: {report.class_name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-blue-600">{report.total_students}</div>
          <div className="text-sm text-gray-600">Total students</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-green-600">{report.submitted_count}</div>
          <div className="text-sm text-gray-600">Submitted</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-yellow-600">{report.not_submitted_count}</div>
          <div className="text-sm text-gray-600">Not submitted</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-gray-800">
            {report.average_score != null ? report.average_score.toFixed(2) : "--"}
          </div>
          <div className="text-sm text-gray-600">Average score</div>
        </div>
      </div>

      <div className="p-4 bg-white rounded shadow space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Score distribution</h3>
        <ScoreBarChart buckets={report.score_buckets} />
      </div>
    </div>
  );
}

