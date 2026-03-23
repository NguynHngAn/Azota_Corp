import { Card } from "@/components/ui/card";

export function AdminExamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Exams</h1>
        <p className="text-sm text-slate-500">Manage and create exams for your classes.</p>
      </div>
      <Card className="border border-slate-100 shadow-sm">
        <div className="py-12 text-center">
          <div className="text-sm text-slate-500">
            This page is UI-ready. Exam management is currently available for teachers in this MVP.
          </div>
        </div>
      </Card>
    </div>
  );
}

