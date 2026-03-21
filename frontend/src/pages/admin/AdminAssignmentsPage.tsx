import { Card } from "../../components/ui/card";

export function AdminAssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
        <p className="text-sm text-slate-500">Schedule exams to classes with time windows.</p>
      </div>
      <Card className="border border-slate-100 shadow-sm">
        <div className="py-12 text-center">
          <div className="text-sm text-slate-500">
            This page is UI-ready. Assignment flows are available in teacher dashboard for this MVP.
          </div>
        </div>
      </Card>
    </div>
  );
}

