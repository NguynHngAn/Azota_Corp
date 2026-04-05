import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { createExam } from "@/services/exams.service";
import { type ExamFormState, emptyQuestion } from "@/pages/exams/types";
import { ExamEditorForm } from "@/pages/exams/ExamEditorForm";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";
import {
  NEW_EXAM_DRAFT_KEY,
  clearExamDraftBackup,
  readExamDraftBackup,
  writeExamDraftBackup,
} from "@/pages/exams/examDraftStorage";

const initialState: ExamFormState = {
  title: "",
  description: "",
  is_draft: true,
  shuffle_questions: false,
  shuffle_options: false,
  questions: [],
};

function buildCreatePayload(state: ExamFormState) {
  return {
    title: state.title.trim(),
    description: state.description.trim() || null,
    is_draft: true as const,
    shuffle_questions: state.shuffle_questions,
    shuffle_options: state.shuffle_options,
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
}

export function CreateExamPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const [state, setState] = useState<ExamFormState>(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restore unsaved new-exam work after refresh (no server id yet)
  useEffect(() => {
    const backup = readExamDraftBackup(NEW_EXAM_DRAFT_KEY);
    if (backup) setState(backup.state);
  }, []);

  useEffect(() => {
    writeExamDraftBackup(NEW_EXAM_DRAFT_KEY, {
      version: 1,
      updatedAt: Date.now(),
      state,
    });
  }, [state]);

  async function createDraftOnServer(openBank: boolean) {
    if (!token) return;
    if (!state.title.trim()) {
      setError(t("examEditor.title", lang));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const created = await createExam(buildCreatePayload(state), token);
      clearExamDraftBackup(NEW_EXAM_DRAFT_KEY);
      navigate(`/teacher/exams/${created.id}${openBank ? "?openBank=1" : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("questionBank.saveFailed", lang));
    } finally {
      setSubmitting(false);
    }
  }

  /** First save always creates a server draft (no id on this page) and moves to the editor route */
  async function handleSave() {
    await createDraftOnServer(false);
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
          <h1 className="text-2xl font-bold text-foreground">{t("common.createExam", lang)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("examEditor.reviewMessage", lang)}</p>
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
        onAddFromBank={() => void createDraftOnServer(true)}
        onSave={() => void handleSave()}
        saving={submitting}
        saveLabel={t("common.save", lang)}
      />
    </div>
  );
}
