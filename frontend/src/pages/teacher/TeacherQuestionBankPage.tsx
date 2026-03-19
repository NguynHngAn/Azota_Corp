import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export function TeacherQuestionBankPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Question Bank</h1>
        <p className="text-sm text-slate-500">0 questions total</p>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <div className="max-w-md">
          <Input placeholder="Search questions..." />
        </div>
        <div className="py-12 text-center text-sm text-slate-500">
          No questions found.
        </div>
      </Card>
    </div>
  );
}

