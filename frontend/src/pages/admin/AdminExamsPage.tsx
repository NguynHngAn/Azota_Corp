import { Card } from "@/components/ui/card";

export function AdminExamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exams</h1>
        <p className="text-sm text-muted-foreground">Manage and create exams for your classes.</p>
      </div>
      <Card className=" p-6">
        <div className="py-12 text-center">
          <div className="text-sm text-muted-foreground">
            This page is UI-ready. Exam management is currently available for teachers in this MVP.
          </div>
        </div>
      </Card>
    </div>
  );
}

