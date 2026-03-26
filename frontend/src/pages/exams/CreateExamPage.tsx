import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { createExam } from "@/services/exams.service";
import { type ExamFormState, emptyQuestion, validateExamForm } from "@/pages/exams/types";
import { ExamEditorForm } from "@/pages/exams/ExamEditorForm";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/layouts/icons";

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

  async function createDraftAndGo(openBank: boolean) {
    if (!token) return;
    if (!state.title.trim()) {
      setError("Exam title is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title: state.title.trim(),
        description: state.description.trim() || null,
        is_draft: true,
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
      navigate(`/teacher/exams/${created.id}${openBank ? "?openBank=1" : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => navigate(-1)}>
          <Icons.ArrowLeft className="size-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Exam</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Set up a new exam with questions and answer options.</p>
        </div>
      </div>
        
      {error && (
        <Card className="border border-border bg-secondary shadow-none hover:shadow-none">
          <div className="text-sm text-muted-foreground">{error}</div>
        </Card>
      )}
      <ExamEditorForm
        state={state}
        setState={setState}
        onAddQuestion={addQuestion}
        onAddFromBank={() => void createDraftAndGo(true)}
        onSave={handleSave}
        saving={submitting}
        saveLabel="Save"
      />
    </div>
  );
}
