import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminOverviewReport, type AdminOverviewReportResponse } from "@/services/assignments.service";
import { ScoreBarChart } from "@/components/score-bar-chart";
import { Icons } from "@/components/layouts/icons";
import { StatCard } from "@/components/layouts/StatCard";
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

  if (loading) return <p className="text-muted-foreground">Loading overview...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!report) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            High-level statistics for all assignments in the system.
          </p>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assignments" value={String(report.total_assignments)} change="--" trend="up" icon={<Icons.FileText className="text-blue-600" />} />
        <StatCard title="Assigned students" value={String(report.total_assigned_students)} change="--" trend="up" icon={<Icons.Users className="text-indigo-600" />} />
        <StatCard title="Submitted" value={String(report.total_submitted)} change="--" trend="up" icon={<Icons.CheckCircle className="text-green-600" />} />
        <StatCard title="Average score" value={report.average_score != null ? report.average_score.toFixed(2) : "--"} change="--" trend="up" icon={<Icons.Chart className="text-foreground" />} />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm text-muted-foreground">Score distribution</h3>
        <ScoreBarChart buckets={report.score_buckets} />
      </div>
    </div>
  );
}

