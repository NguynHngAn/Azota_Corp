import type { ExamFormState, QuestionRow, QuestionType } from "./types";
import { emptyOption } from "./types";

interface ExamEditorFormProps {
  state: ExamFormState;
  setState: React.Dispatch<React.SetStateAction<ExamFormState>>;
  onAddQuestion: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
}

export function ExamEditorForm({
  state,
  setState,
  onAddQuestion,
  onSave,
  saving,
  saveLabel,
}: ExamEditorFormProps) {
  function setMeta(field: keyof Pick<ExamFormState, "title" | "description" | "is_draft">, value: string | boolean) {
    setState((s) => ({ ...s, [field]: value }));
  }

  function setQuestion(index: number, updater: (q: QuestionRow) => QuestionRow) {
    setState((s) => ({
      ...s,
      questions: s.questions.map((q, i) => (i === index ? updater(q) : q)),
    }));
  }

  function removeQuestion(index: number) {
    setState((s) => ({
      ...s,
      questions: s.questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order_index: i })),
    }));
  }

  function addOption(qIndex: number) {
    setQuestion(qIndex, (q) => ({
      ...q,
      options: [...q.options, emptyOption(q.options.length)],
    }));
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestion(qIndex, (q) => {
      const opts = q.options.filter((_, i) => i !== oIndex).map((o, i) => ({ ...o, order_index: i }));
      let correctCount = opts.filter((o) => o.is_correct).length;
      if (q.question_type === "single_choice" && correctCount !== 1) {
        opts.forEach((o, i) => {
          opts[i] = { ...o, is_correct: i === 0 };
        });
      }
      return { ...q, options: opts };
    });
  }

  function setOptionCorrect(qIndex: number, oIndex: number, is_correct: boolean) {
    setQuestion(qIndex, (q) => {
      const options = q.options.map((o, i) => {
        if (q.question_type === "single_choice") {
          return { ...o, is_correct: i === oIndex };
        }
        return i === oIndex ? { ...o, is_correct } : o;
      });
      return { ...q, options };
    });
  }

  function setQuestionType(qIndex: number, question_type: QuestionType) {
    setQuestion(qIndex, (q) => {
      let options = [...q.options];
      const correctCount = options.filter((o) => o.is_correct).length;
      if (question_type === "single_choice" && correctCount !== 1) {
        const firstCorrect = options.findIndex((o) => o.is_correct);
        options = options.map((o, i) => ({ ...o, is_correct: (firstCorrect >= 0 ? i === firstCorrect : i === 0) }));
      }
      return { ...q, question_type, options };
    });
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded shadow space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => setMeta("title", e.target.value)}
            placeholder="Exam title"
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            value={state.description}
            onChange={(e) => setMeta("description", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.is_draft}
            onChange={(e) => setMeta("is_draft", e.target.checked)}
          />
          <span className="text-sm">Save as draft</span>
        </label>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Questions</h3>
          <button
            type="button"
            onClick={onAddQuestion}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Add question
          </button>
        </div>
        {state.questions.length === 0 ? (
          <p className="text-gray-500 text-sm">No questions. Click &quot;Add question&quot; to start.</p>
        ) : (
          <ul className="space-y-4">
            {state.questions.map((q, qIndex) => (
              <li key={qIndex} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Question {qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <select
                    value={q.question_type}
                    onChange={(e) => setQuestionType(qIndex, e.target.value as QuestionType)}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="single_choice">Single choice</option>
                    <option value="multiple_choice">Multiple choice</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Question text *</label>
                  <textarea
                    value={q.text}
                    onChange={(e) => setQuestion(qIndex, (q) => ({ ...q, text: e.target.value }))}
                    rows={2}
                    placeholder="Enter question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Options (mark correct)</label>
                  <ul className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <li key={oIndex} className="flex items-center gap-2">
                        <input
                          type={q.question_type === "single_choice" ? "radio" : "checkbox"}
                          name={q.question_type === "single_choice" ? `q-${qIndex}-correct` : undefined}
                          checked={opt.is_correct}
                          onChange={() => setOptionCorrect(qIndex, oIndex, !opt.is_correct)}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) =>
                            setQuestion(qIndex, (q) => ({
                              ...q,
                              options: q.options.map((o, i) => (i === oIndex ? { ...o, text: e.target.value } : o)),
                            }))
                          }
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={q.options.length <= 2}
                          className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    + Add option
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saveLabel}
        </button>
      </div>
    </div>
  );
}
