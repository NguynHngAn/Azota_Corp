export type QuestionType = "single_choice" | "multiple_choice";

export interface OptionRow {
  order_index: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionRow {
  id?: number;
  order_index: number;
  question_type: QuestionType;
  text: string;
  options: OptionRow[];
}

export interface ExamFormState {
  title: string;
  description: string;
  is_draft: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  questions: QuestionRow[];
}

export function emptyOption(order: number): OptionRow {
  return { order_index: order, text: "", is_correct: false };
}

export function emptyQuestion(order: number): QuestionRow {
  return {
    order_index: order,
    question_type: "single_choice",
    text: "",
    options: [
      { order_index: 0, text: "", is_correct: false },
      { order_index: 1, text: "", is_correct: true },
    ],
  };
}

export function validateExamForm(state: ExamFormState): string[] {
  const errors: string[] = [];
  if (!state.title.trim()) errors.push("Title is required.");
  state.questions.forEach((q, i) => {
    if (!q.text.trim()) errors.push(`Question ${i + 1}: text is required.`);
    if (q.options.length < 2) errors.push(`Question ${i + 1}: at least 2 options required.`);
    const correctCount = q.options.filter((o) => o.is_correct).length;
    if (q.question_type === "single_choice" && correctCount !== 1) {
      errors.push(`Question ${i + 1}: single choice must have exactly one correct answer.`);
    }
    if (q.question_type === "multiple_choice" && correctCount < 1) {
      errors.push(`Question ${i + 1}: multiple choice must have at least one correct answer.`);
    }
  });
  return errors;
}
