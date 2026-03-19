import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createExam } from "../../api/exams";
import { type ExamFormState, emptyQuestion, validateExamForm } from "./types";
import { ExamEditorForm } from "./ExamEditorForm";
import { Card } from "../../components/ui/Card";

const initialState: ExamFormState = {
  title: "",
  description: "",
  is_draft: true,
  questions: [],
};

export function CreateExamPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<ExamFormState>(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    const errors = validateExamForm(state);
    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }
    setError("");
    setSubmitting(true);
    if (!token) return;
    try {
      const payload = {
        title: state.title.trim(),
        description: state.description.trim() || null,
        is_draft: state.is_draft,
        questions: state.questions.map((q, i) => ({
          order_index: i,
          question_type: q.question_type,
          text: q.text.trim(),
          options: q.options.map((o, j) => ({
            order_index: j,
            text: o.text.trim(),
            is_correct: o.is_correct,
          })),
        })),
      };
      const created = await createExam(payload, token);
      navigate(`/teacher/exams/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  function addQuestion() {
    setState((s) => ({
      ...s,
      questions: [...s.questions, emptyQuestion(s.questions.length)],
    }));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create Exam</h1>
        <p className="text-sm text-slate-500">Set up a new exam with questions and answer options.</p>
      </div>
      {error && (
        <Card className="border border-rose-100 bg-rose-50 shadow-none hover:shadow-none">
          <div className="text-sm text-rose-800">{error}</div>
        </Card>
      )}
      <ExamEditorForm
        state={state}
        setState={setState}
        onAddQuestion={addQuestion}
        onSave={handleSave}
        saving={submitting}
        saveLabel="Save"
      />
    </div>
  );
}
