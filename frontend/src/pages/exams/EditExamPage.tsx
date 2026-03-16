import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getExam,
  updateExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  type ExamDetail,
} from "../../api/exams";
import type { ExamFormState } from "./types";
import { validateExamForm } from "./types";
import { ExamEditorForm } from "./ExamEditorForm";

function examToFormState(exam: ExamDetail): ExamFormState {
  return {
    title: exam.title,
    description: exam.description ?? "",
    is_draft: exam.is_draft,
    questions: exam.questions.map((q) => ({
      id: q.id,
      order_index: q.order_index,
      question_type: q.question_type,
      text: q.text,
      options: q.options.map((o) => ({
        order_index: o.order_index,
        text: o.text,
        is_correct: o.is_correct,
      })),
    })),
  };
}

export function EditExamPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const examId = id ? parseInt(id, 10) : NaN;
  const [state, setState] = useState<ExamFormState | null>(null);
  const [originalQuestionIds, setOriginalQuestionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !id || isNaN(examId)) return;
    getExam(examId, token)
      .then((exam) => {
        setState(examToFormState(exam));
        setOriginalQuestionIds(exam.questions.map((q) => q.id));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token, id, examId]);

  async function handleSave() {
    if (!state || !token) return;
    const errors = validateExamForm(state);
    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await updateExam(
        examId,
        {
          title: state.title.trim(),
          description: state.description.trim() || null,
          is_draft: state.is_draft,
        },
        token
      );

      const currentIds = new Set(state.questions.map((q) => q.id).filter((x): x is number => x != null));
      for (const oldId of originalQuestionIds) {
        if (!currentIds.has(oldId)) {
          await deleteQuestion(examId, oldId, token);
        }
      }

      const newIds: (number | undefined)[] = [];
      for (let i = 0; i < state.questions.length; i++) {
        const q = state.questions[i];
        const payload = {
          order_index: i,
          question_type: q.question_type,
          text: q.text.trim(),
          options: q.options.map((o, j) => ({
            order_index: j,
            text: o.text.trim(),
            is_correct: o.is_correct,
          })),
        };
        if (q.id != null) {
          await updateQuestion(examId, q.id, payload, token);
        } else {
          const added = await addQuestion(examId, payload, token);
          newIds[i] = added.id;
        }
      }
      if (newIds.some((id) => id != null)) {
        setOriginalQuestionIds((prev) => [...prev, ...newIds.filter((x): x is number => x != null)]);
        setState((s) => {
          if (!s) return s;
          return {
            ...s,
            questions: s.questions.map((q, i) => ({ ...q, id: newIds[i] ?? q.id })),
          };
        });
      }

      navigate("/teacher/exams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  function addQuestionLocal() {
    setState((s) => {
      if (!s) return s;
      return {
        ...s,
        questions: [
          ...s.questions,
          {
            order_index: s.questions.length,
            question_type: "single_choice" as const,
            text: "",
            options: [
              { order_index: 0, text: "", is_correct: false },
              { order_index: 1, text: "", is_correct: true },
            ],
          },
        ],
      };
    });
  }

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error && !state) return <p className="text-red-600">{error}</p>;
  if (!state) return null;

  return (
    <div>
      <div className="mb-4">
        <Link to="/teacher/exams" className="text-blue-600 hover:underline">
          ← Back to exams
        </Link>
      </div>
      <h2 className="text-lg font-semibold mb-4">Edit exam</h2>
      {error && <p className="mb-2 text-red-600 text-sm">{error}</p>}
      <ExamEditorForm
        state={state}
        setState={setState as React.Dispatch<React.SetStateAction<ExamFormState>>}
        onAddQuestion={addQuestionLocal}
        onSave={handleSave}
        saving={submitting}
        saveLabel="Save exam"
      />
    </div>
  );
}
