import { Card } from "@/components/ui/card";

export function AdminAssignmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <p className="text-sm text-muted-foreground">Schedule exams to classes with time windows.</p>
      </div>
      <Card className=" p-6">
        <div className="py-12 text-center">
          <div className="text-sm text-muted-foreground">
            This page is UI-ready. Assignment flows are available in teacher dashboard for this MVP.
          </div>
        </div>
      </Card>
    </div>
  );
}

