import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminOverviewReport, type AdminOverviewReportResponse } from "../../api/assignments";
import { ScoreBarChart } from "../../components/ScoreBarChart";

export function AdminOverviewReportPage() {
  const { token } = useAuth();
  const [report, setReport] = useState<AdminOverviewReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getAdminOverviewReport(token)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load overview"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-600">Loading overview...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!report) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold mb-2">System overview</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-blue-600">{report.total_assignments}</div>
          <div className="text-sm text-gray-600">Assignments</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-indigo-600">{report.total_assigned_students}</div>
          <div className="text-sm text-gray-600">Assigned students</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-green-600">{report.total_submitted}</div>
          <div className="text-sm text-gray-600">Submitted</div>
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

