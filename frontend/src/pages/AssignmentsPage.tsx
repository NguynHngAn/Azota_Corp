import { DashboardLayout } from "@/components/DashboardLayout";
import { Loader2, Trash2, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  deleteAssignment,
  listAssignments,
  ScoreBucket,
} from "@/api/assignments";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { AUTH_TOKEN_KEY } from "@/utils/constants";

interface AssignmentRow {
  id: string;
  exam_title: string;
  class_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  created_at: string;
  submissionCount: number;
  totalStudents: number;
  submittedCount: number;
  notSubmittedCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  scoreBuckets: ScoreBucket[];
}

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listAssignments(token);
      setAssignments(
        data.map((a) => ({
          id: a.id.toString(),
          exam_title: a.exam_title,
          class_name: a.class_name,
          start_time: a.start_time,
          end_time: a.end_time,
          duration_minutes: a.duration_minutes,
          created_at: a.created_at,
          // These reporting fields are not returned by list endpoint.
          submissionCount: 0,
          totalStudents: 0,
          submittedCount: 0,
          notSubmittedCount: 0,
          averageScore: 0,
          minScore: 0,
          maxScore: 0,
          scoreBuckets: [] as ScoreBucket[],
        })),
      );
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchAssignments();
  }, [fetchAssignments]);

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(Number(id), token);
      toast.success("Assignment deleted");
      await fetchAssignments();
    } catch {
      toast.error("Failed to delete assignment");
    }
  };

  const isActive = (a: AssignmentRow) => {
    const now = new Date();
    return new Date(a.start_time) <= now && now <= new Date(a.end_time);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule exams to classes with time windows.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No assignments yet.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Class
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Time Window
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {a.exam_title}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {a.class_name}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden md:table-cell">
                      {format(new Date(a.start_time), "MMM d, HH:mm")} —{" "}
                      {format(new Date(a.end_time), "MMM d, HH:mm")}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {a.duration_minutes} min
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {a.submissionCount}
                    </td>
                    <td className="py-3 px-4">
                      {isActive(a) ? (
                        <span className="badge-success">Active</span>
                      ) : new Date(a.end_time) < new Date() ? (
                        <span className="badge-neutral">Ended</span>
                      ) : (
                        <span className="badge-info">Upcoming</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/assignments/${a.id}/submissions`}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentsPage;
