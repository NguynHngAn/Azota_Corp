import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowLeft, FileSearch } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const SubmissionsReviewPage = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/assignments")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Submissions Review
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Assignment {assignmentId ?? "-"}
            </p>
          </div>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <FileSearch className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Submission review data is currently unavailable in this build.
            Please open assignment reports for detailed analytics.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmissionsReviewPage;
