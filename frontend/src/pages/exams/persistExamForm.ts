import { addQuestion, deleteQuestion, updateExam, updateQuestion } from "@/services/exams.service";
import type { ExamFormState } from "@/pages/exams/types";

export interface PersistExamResult {
  state: ExamFormState;
  /** Server question ids after sync; use as the baseline for the next delete pass */
  trackedQuestionIds: number[];
}

/**
 * Persists exam metadata and all questions to the server.
 * When publishing (user unchecked draft), keeps is_draft true until questions are synced, then flips to published.
 */
export async function persistExamForm(
  examId: number,
  state: ExamFormState,
  trackedQuestionIds: number[],
  token: string,
  options: { lockDraftUntilPublished: boolean },
): Promise<PersistExamResult> {
  const meta = {
    title: state.title.trim(),
    description: state.description.trim() || null,
    shuffle_questions: state.shuffle_questions,
    shuffle_options: state.shuffle_options,
  };

  const isPublishing = options.lockDraftUntilPublished && !state.is_draft;
  await updateExam(
    examId,
    {
      ...meta,
      is_draft: isPublishing ? true : state.is_draft,
    },
    token,
  );

  const currentIds = new Set(state.questions.map((q) => q.id).filter((x): x is number => x != null));
  for (const oldId of trackedQuestionIds) {
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

  const mergedQuestions = state.questions.map((q, i) => ({ ...q, id: newIds[i] ?? q.id }));

  if (isPublishing) {
    await updateExam(
      examId,
      {
        ...meta,
        is_draft: false,
      },
      token,
    );
  }

  return {
    state: { ...state, questions: mergedQuestions },
    trackedQuestionIds: mergedQuestions.map((q) => q.id).filter((x): x is number => x != null),
  };
}
