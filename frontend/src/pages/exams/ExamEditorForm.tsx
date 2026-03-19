import type { Dispatch, SetStateAction } from "react";
import type { ExamFormState, QuestionRow, QuestionType } from "./types";
import { emptyOption } from "./types";
import { useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface ExamEditorFormProps {
  state: ExamFormState;
  setState: Dispatch<SetStateAction<ExamFormState>>;
  onAddQuestion: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
}

type Step = 1 | 2 | 3;

function Stepper({ step }: { step: Step }) {
  const items = useMemo(
    () => [
      { n: 1 as Step, label: "Basic Info" },
      { n: 2 as Step, label: "Questions" },
      { n: 3 as Step, label: "Review" },
    ],
    [],
  );

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3">
          {items.map((it, idx) => {
            const done = it.n < step;
            const active = it.n === step;
            return (
              <div key={it.n} className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                      done ? "bg-emerald-100 text-emerald-800" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {done ? "✓" : it.n}
                  </div>
                  <div className={`text-sm ${active ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                    {it.label}
                  </div>
                </div>
                {idx < items.length - 1 && (
                  <div className="mt-3 h-px bg-slate-100" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ExamEditorForm({
  state,
  setState,
  onAddQuestion,
  onSave,
  saving,
  saveLabel,
}: ExamEditorFormProps) {
  const [step, setStep] = useState<Step>(1);

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

  const canNextFromBasic = state.title.trim().length > 0;
  const questionCount = state.questions.length;

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          {step === 1 && (
            <Card className="shadow-sm hover:shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title *</label>
                  <Input value={state.title} onChange={(e) => setMeta("title", e.target.value)} placeholder="e.g. Math Final Exam" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <Textarea
                    value={state.description}
                    onChange={(e) => setMeta("description", e.target.value)}
                    rows={4}
                    placeholder="Brief description..."
                  />
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="shadow-sm hover:shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">{questionCount} question(s)</div>
                <Button size="sm" variant="secondary" type="button" onClick={onAddQuestion}>
                  + Add Question
                </Button>
              </div>

              {state.questions.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No questions yet. Click “Add Question” to start.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {state.questions.map((q, qIndex) => (
                    <div key={qIndex} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">Question {qIndex + 1}</div>
                          <div className="mt-2 grid gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                              <Textarea
                                value={q.text}
                                onChange={(e) => setQuestion(qIndex, (qq) => ({ ...qq, text: e.target.value }))}
                                rows={2}
                                placeholder="Question text..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                              <Select
                                value={q.question_type}
                                onChange={(e) => setQuestionType(qIndex, e.target.value as QuestionType)}
                              >
                                <option value="single_choice">Single Choice</option>
                                <option value="multiple_choice">Multiple Choice</option>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" type="button" onClick={() => removeQuestion(qIndex)}>
                          Remove
                        </Button>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs font-medium text-slate-600 mb-2">Answer Options (mark correct)</div>
                        <div className="space-y-2">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <input
                                className="h-4 w-4"
                                type={q.question_type === "single_choice" ? "radio" : "checkbox"}
                                name={q.question_type === "single_choice" ? `q-${qIndex}-correct` : undefined}
                                checked={opt.is_correct}
                                onChange={() => setOptionCorrect(qIndex, oIndex, !opt.is_correct)}
                              />
                              <div className="flex-1">
                                <Input
                                  value={opt.text}
                                  onChange={(e) =>
                                    setQuestion(qIndex, (qq) => ({
                                      ...qq,
                                      options: qq.options.map((o, i) => (i === oIndex ? { ...o, text: e.target.value } : o)),
                                    }))
                                  }
                                  placeholder={`Option ${oIndex + 1}`}
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                disabled={q.options.length <= 2}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="ghost" type="button" onClick={() => addOption(qIndex)}>
                            + Add option
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {step === 3 && (
            <Card className="shadow-sm hover:shadow-sm">
              <div className="py-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-semibold">
                  ✓
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-900">Ready to Save</div>
                <div className="mt-1 text-sm text-slate-500">Review your exam details before saving.</div>
              </div>

              <div className="mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Title</span>
                  <span className="font-medium text-slate-900 truncate max-w-[60%]">{state.title || "—"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-medium text-slate-900">{state.questions.length}</span>
                </div>
              </div>

              <label className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={!state.is_draft}
                  onChange={(e) => setMeta("is_draft", !e.target.checked)}
                />
                <span>Publish immediately (not draft)</span>
                <Badge variant={state.is_draft ? "warning" : "success"}>{state.is_draft ? "Draft" : "Published"}</Badge>
              </label>
            </Card>
          )}

          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)))}
              disabled={step === 1}
            >
              ← Previous
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)))}
                disabled={step === 1 && !canNextFromBasic}
              >
                Next →
              </Button>
            ) : (
              <Button type="button" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : saveLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
