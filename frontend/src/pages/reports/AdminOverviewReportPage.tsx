import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminOverviewReport, type AdminOverviewReportResponse } from "@/services/assignments.service";
import { ScoreBarChart } from "@/components/score-bar-chart";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

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
      <PageHeader
        title="System overview"
        description="High-level statistics for all assignments in the system."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Assignments</div>
          <div className="text-2xl font-bold text-blue-600">{report.total_assignments}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Assigned students</div>
          <div className="text-2xl font-bold text-indigo-600">{report.total_assigned_students}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Submitted</div>
          <div className="text-2xl font-bold text-green-600">{report.total_submitted}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Average score</div>
          <div className="text-2xl font-bold text-gray-800">
            {report.average_score != null ? report.average_score.toFixed(2) : "--"}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Score distribution</h3>
        <ScoreBarChart buckets={report.score_buckets} />
      </Card>
    </div>
  );
}

