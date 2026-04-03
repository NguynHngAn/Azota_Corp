import type { Dispatch, SetStateAction } from "react";
import type { ExamFormState, QuestionRow, QuestionType } from "@/pages/exams/types";
import { emptyOption } from "@/pages/exams/types";
import { useId, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";

interface ExamEditorFormProps {
  state: ExamFormState;
  setState: Dispatch<SetStateAction<ExamFormState>>;
  onAddQuestion: () => void;
  onAddFromBank?: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
}

type Step = 1 | 2 | 3;

function Stepper({ step, lang }: { step: Step; lang: ReturnType<typeof useLanguage> }) {
  const items = useMemo(
    () => [
      { n: 1 as Step, label: t("examEditor.step.basicInfo", lang) },
      { n: 2 as Step, label: t("examEditor.step.questions", lang) },
      { n: 3 as Step, label: t("examEditor.step.review", lang) },
    ],
    [lang],
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
                      done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {done ? "✓" : it.n}
                  </div>
                  <div className={`text-sm ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {it.label}
                  </div>
                </div>
                {idx < items.length - 1 && (
                  <div className="mt-3 h-px bg-border" />
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
  onAddFromBank,
  onSave,
  saving,
  saveLabel,
}: ExamEditorFormProps) {
  const lang = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const formFieldId = useId();
  const isEditable = state.is_draft;

  function text(key: string, values?: Record<string, string | number>) {
    const base = t(key as never, lang);
    if (!values) return base;
    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
      base,
    );
  }

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
    <div className="max-w-3xl mx-auto space-y-8">
      <Stepper step={step} lang={lang} />

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          {step === 1 && (
            <div className="glass-card p-6">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("examEditor.title", lang)}</label>
                  <Input
                    value={state.title}
                    onChange={(e) => setMeta("title", e.target.value)}
                    placeholder={t("examEditor.titlePlaceholder", lang)}
                    disabled={!isEditable}
                  />
                </div>
                <div>
                  <label htmlFor={`${formFieldId}-exam-description`}
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    {t("examEditor.description", lang)}
                  </label>
                  <Textarea
                    id={`${formFieldId}-exam-description`}
                    value={state.description}
                    onChange={(e) => setMeta("description", e.target.value)}
                    rows={4}
                    placeholder={t("examEditor.descriptionPlaceholder", lang)}
                    disabled={!isEditable}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{text("examEditor.questionCount", { count: questionCount })}</div>
                <div className="flex items-center gap-2">
                  {isEditable && onAddFromBank ? (
                    <Button size="sm" variant="outline" type="button" onClick={onAddFromBank}>
                      <Icons.Plus className="size-4" /> {t("examEditor.addFromBank", lang)}
                    </Button>
                  ) : null}
                  {isEditable ? (
                    <Button size="sm" variant="outline" type="button" onClick={onAddQuestion}>
                      <Icons.Plus className="size-4" /> {t("examEditor.addQuestion", lang)}
                    </Button>
                  ) : null}
                </div>
              </div>

              {state.questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t("examEditor.empty", lang)}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {state.questions.map((q, qIndex) => (
                    <div key={qIndex} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{text("examEditor.questionTitle", { number: qIndex + 1 })}</div>
                          <div className="mt-2 grid gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                              <Textarea
                                id={`${formFieldId}-question-${qIndex}`}
                                value={q.text}
                                onChange={(e) => setQuestion(qIndex, (qq) => ({ ...qq, text: e.target.value }))}
                                rows={2}
                                placeholder={t("examEditor.questionTextPlaceholder", lang)}
                                aria-label={text("examEditor.questionAria", { number: qIndex + 1 })}
                                disabled={!isEditable}
                              />
                            </div>
                            <div >
                              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("common.type", lang)}</label>
                              <select
                                value={q.question_type}
                                onChange={(e) => setQuestionType(qIndex, e.target.value as QuestionType)}
                                disabled={!isEditable}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                <option value="single_choice">{t("questionBank.editor.singleChoice", lang)}</option>
                                <option value="multiple_choice">{t("questionBank.editor.multipleChoice", lang)}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        {isEditable ? (
                          <button
                            className="p-1 rounded hover:bg-destructive/10"
                            onClick={() => removeQuestion(qIndex)}
                            type="button"
                          >
                            <Icons.Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <div className="text-xs text-muted-foreground mb-2">{t("examEditor.answerOptions", lang)} ({t("examEditor.markCorrect", lang)})</div>
                        <div className="space-y-2">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                className="h-4 w-4 accent-primary"
                                type={q.question_type === "single_choice" ? "radio" : "checkbox"}
                                name={q.question_type === "single_choice" ? `q-${qIndex}-correct` : undefined}
                                checked={opt.is_correct}
                                onChange={() => setOptionCorrect(qIndex, oIndex, !opt.is_correct)}
                                disabled={!isEditable}
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
                                  placeholder={text("examEditor.optionPlaceholder", { number: oIndex + 1 })}
                                  disabled={!isEditable}
                                />
                              </div>
                              {isEditable ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  disabled={q.options.length <= 2}
                                >
                                  {t("examEditor.removeOption", lang)}
                                </Button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                        {isEditable ? (
                          <div className="mt-3">
                            <Button size="sm" variant="ghost" type="button" onClick={() => addOption(qIndex)}>
                              + {t("examEditor.addOption", lang)}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <Card className="text-center py-8 space-y-4">
              <div className="py-6 ">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Icons.Check className="size-8 text-success" />
                </div>
                <div className="mt-3 text-lg font-semibold text-foreground">{t("examEditor.readyToSave", lang)}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("examEditor.reviewMessage", lang)}</div>
              </div>

              <div className="glass-card p-4 max-w-sm mx-auto text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("examEditor.reviewTitle", lang)}</span>
                  <span className="font-medium text-foreground truncate max-w-[60%]">{state.title || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("examEditor.step.questions", lang)}</span>
                  <span className="font-medium text-foreground">{state.questions.length}</span>
                </div>
              </div>

              <label className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <input
                  className="accent-primary"
                  type="checkbox"
                  checked={!state.is_draft}
                  onChange={(e) => setMeta("is_draft", !e.target.checked)}
                />
                <span>{t("examEditor.publishImmediately", lang)}</span>
                <Badge variant={state.is_draft ? "outline" : "default"} className="text-xs">{state.is_draft ? t("common.status.draft", lang) : t("common.status.published", lang)}</Badge>
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
              ← {t("examEditor.previous", lang)}
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)))}
                disabled={step === 1 && !canNextFromBasic}
              >
                {t("examEditor.next", lang)} →
              </Button>
            ) : (
              <Button type="button" onClick={onSave} disabled={saving}>
                {saving ? t("common.saving", lang) : saveLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
