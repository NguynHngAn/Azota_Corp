import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "react-router-dom";

const MyResultsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Results</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your completed assignments from your classes.
          </p>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm text-muted-foreground">
            Result details are available after you submit an assignment.
            Continue from your classes to take exams and view submission
            feedback.
          </p>
          <div className="mt-4">
            <Link
              to="/my-classes"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Go to My Classes
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyResultsPage;
