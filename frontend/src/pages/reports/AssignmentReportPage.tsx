import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAssignmentReport, type AssignmentReportResponse } from "../../api/assignments";
import { ScoreBarChart } from "../../components/ScoreBarChart";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

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
      <PageHeader
        title={report.exam_title}
        description={`Class: ${report.class_name}`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Total students</div>
          <div className="text-2xl font-bold text-blue-600">{report.total_students}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Submitted</div>
          <div className="text-2xl font-bold text-green-600">{report.submitted_count}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-gray-500 mb-1">Not submitted</div>
          <div className="text-2xl font-bold text-yellow-600">{report.not_submitted_count}</div>
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

