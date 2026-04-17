import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { t, useLanguage } from "@/i18n";
import {
  createBankQuestion,
  type BankQuestionCreate,
  type QuestionDifficulty,
} from "@/services/questionBank.service";
import {
  generateTeacherAIQuestions,
  type TeacherAIQuestionRequest,
  type TeacherAITask,
} from "@/services/teacherAi.service";
import { Icons } from "../layouts/Icons";

type SelectionMap = Record<number, boolean>;
type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  tone?: "default" | "muted" | "warning";
};

const defaultPromptKeys: Record<
  TeacherAITask,
  "teacherAi.defaultPrompt.generate" | "teacherAi.defaultPrompt.similar"
> = {
  generate_questions: "teacherAi.defaultPrompt.generate",
  suggest_similar_questions: "teacherAi.defaultPrompt.similar",
};

function createMessageId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function shouldSimulatePartialSaveFailure(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("teacherAiPartialSaveFailure") === "1") return true;
    return window.localStorage.getItem("teacherAi.simulatePartialSaveFailure") === "1";
  } catch {
    return false;
  }
}

export function TeacherAiAssistantCard() {
  const lang = useLanguage();
  const { token } = useAuth();
  const { success, error: showError } = useToast();
  const userEditedPromptRef = useRef(false);
  const userEditedLanguageRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [task, setTask] = useState<TeacherAITask>("generate_questions");
  const [prompt, setPrompt] = useState<string>(t(defaultPromptKeys.generate_questions, lang));
  const [sourceQuestionText, setSourceQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"single_choice" | "multiple_choice" | "mixed">("single_choice");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [language, setLanguage] = useState(lang === "en" ? "English" : "Vietnamese");
  const [count, setCount] = useState(5);
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiModel, setAiModel] = useState("");
  const [aiProvider, setAiProvider] = useState<"gemini" | "local-fallback" | "">("");
  const [items, setItems] = useState<BankQuestionCreate[]>([]);
  const [selected, setSelected] = useState<SelectionMap>({});
  const [message, setMessage] = useState("");
  const buildWelcomeMessages = useCallback(
    (nextLang: "en" | "vi"): ChatMessage[] => [
      {
        id: "welcome-1",
        role: "assistant",
        text: t("teacherAi.welcomePrimary", nextLang),
      },
      {
        id: "welcome-2",
        role: "assistant",
        text: t("teacherAi.welcomeSecondary", nextLang),
        tone: "muted",
      },
    ],
    [],
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(buildWelcomeMessages(lang));

  const normalizedTags = useMemo(() => {
    return tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);
  }, [tagsText]);

  useEffect(() => {
    if (!userEditedLanguageRef.current) {
      setLanguage(lang === "en" ? "English" : "Vietnamese");
    }
    if (!userEditedPromptRef.current) {
      setPrompt(t(defaultPromptKeys[task], lang));
    }
    setChatMessages((current) => {
      const onlyWelcome =
        current.length <= 2 &&
        current.every((message) => message.id === "welcome-1" || message.id === "welcome-2");
      if (!onlyWelcome) return current;
      const next = buildWelcomeMessages(lang);
      const same =
        current.length === next.length &&
        current.every(
          (message, index) =>
            message.id === next[index].id &&
            message.text === next[index].text &&
            message.tone === next[index].tone,
        );
      return same ? current : next;
    });
  }, [lang, task, chatMessages, buildWelcomeMessages]);

  function resetSelection(nextItems: BankQuestionCreate[]) {
    const nextSelected: SelectionMap = {};
    nextItems.forEach((_, index) => {
      nextSelected[index] = true;
    });
    setSelected(nextSelected);
  }

  function buildRequest(): TeacherAIQuestionRequest | null {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setMessage(t("teacherAi.error.promptRequired", lang));
      return null;
    }
    if (task === "suggest_similar_questions" && !sourceQuestionText.trim()) {
      setMessage(t("teacherAi.error.sourceRequired", lang));
      return null;
    }
    return {
      task,
      prompt: trimmedPrompt,
      count,
      question_type: questionType === "mixed" ? null : questionType,
      difficulty,
      language,
      source_question_text: task === "suggest_similar_questions" ? sourceQuestionText.trim() : null,
      tags: normalizedTags,
    };
  }

  async function handleGenerate() {
    if (!token || saving) return;
    const body = buildRequest();
    if (!body) return;
    setLoading(true);
    setMessage("");
    setChatMessages((current) => [
      ...current,
      {
        id: createMessageId("user"),
        role: "user",
        text: body.prompt,
      },
    ]);
    try {
      const response = await generateTeacherAIQuestions(body, token);
      setAiModel(response.model);
      setAiProvider(response.provider === "local-fallback" ? "local-fallback" : "gemini");
      setItems(response.items);
      resetSelection(response.items);
      setChatMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          text:
            response.provider === "local-fallback"
              ? t("teacherAi.generatedFallback", { count: response.items.length }, lang)
              : t("teacherAi.generatedSuccess", { count: response.items.length }, lang),
          tone: response.provider === "local-fallback" ? "warning" : "default",
        },
        ...(response.note
          ? [
            {
              id: createMessageId("assistant-note"),
              role: "assistant" as const,
              text: response.note,
              tone: "muted" as const,
            },
          ]
          : []),
      ]);
      if (response.items.length === 0) {
        setMessage(t("teacherAi.error.empty", lang));
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : t("teacherAi.error.generateFailed", lang);
      setMessage(text);
      showError({ title: t("teacherAi.toast.requestFailed", lang), description: text });
      setAiModel("");
      setAiProvider("");
      setItems([]);
      setSelected({});
      setChatMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant-error"),
          role: "assistant",
          text,
          tone: "warning",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelected(index: number, checked: boolean) {
    setSelected((current) => ({ ...current, [index]: checked }));
  }

  async function saveSelected() {
    if (!token) return;
    const selectedEntries = items
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => selected[index]);
    if (selectedEntries.length === 0) {
      setMessage(t("teacherAi.error.selectAtLeastOne", lang));
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const outcomes = await Promise.allSettled(
        selectedEntries.map(({ item }, idx) => {
          if (shouldSimulatePartialSaveFailure() && idx === selectedEntries.length - 1) {
            return Promise.reject(new Error(t("teacherAi.error.saveFailed", lang)));
          }
          return createBankQuestion(item, token);
        }),
      );
      const successfulIndexes = new Set<number>();
      const failedIndexes = new Set<number>();
      outcomes.forEach((result, idx) => {
        const originalIndex = selectedEntries[idx].index;
        if (result.status === "fulfilled") successfulIndexes.add(originalIndex);
        else failedIndexes.add(originalIndex);
      });
      const successCount = successfulIndexes.size;
      const failedCount = failedIndexes.size;

      if (successCount > 0 && failedCount === 0) {
        success({
          title: t("teacherAi.toast.savedTitle", lang),
          description: t("teacherAi.toast.savedDescription", { count: successCount }, lang),
        });
      } else if (successCount > 0) {
        success({
          title: t("teacherAi.toast.partialSavedTitle", lang),
          description: t(
            "teacherAi.toast.partialSavedDescription",
            { successCount, failedCount },
            lang,
          ),
        });
      } else {
        setMessage(t("teacherAi.error.saveFailed", lang));
      }

      const remainingEntries = items
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => !successfulIndexes.has(index));
      const nextItems = remainingEntries.map(({ item }) => item);
      const nextSelected: SelectionMap = {};
      remainingEntries.forEach(({ index }, nextIndex) => {
        nextSelected[nextIndex] = failedIndexes.has(index);
      });
      setItems(nextItems);
      setSelected(nextSelected);

      if (successCount > 0) {
        setChatMessages((current) => [
          ...current,
          {
            id: createMessageId("assistant-save"),
            role: "assistant",
            text: t("teacherAi.savedChatMessage", { count: successCount }, lang),
          },
        ]);
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : t("teacherAi.error.saveFailed", lang);
      setMessage(text);
      showError({ title: t("teacherAi.toast.saveFailedTitle", lang), description: text });
    } finally {
      setSaving(false);
    }
  }

  function switchTask(nextTask: TeacherAITask) {
    setTask(nextTask);
    userEditedPromptRef.current = false;
    setPrompt(t(defaultPromptKeys[nextTask], lang));
    setMessage("");
  }

  const selectedCount = items.filter((_, index) => selected[index]).length;

  if (!open || minimized) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-105"
        aria-label={t("teacherAi.open", lang)}
      >
        <div className="flex flex-col items-center justify-center leading-none">
          <Icons.MessageCircle className="h-6 w-6" />
          <span className="mt-1 text-[10px] font-semibold">{t("teacherAi.shortLabel", lang)}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-[480px]">
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
              <Icons.Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-none">{t("teacherAi.title", lang)}</div>
              <div className="mt-1 text-xs text-primary-foreground/80">{t("teacherAi.subtitle", lang)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMinimized((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-background transition-colors hover:bg-background/80"
              aria-label={minimized ? t("teacherAi.expand", lang) : t("teacherAi.minimize", lang)}
            >
              <Icons.Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-background transition-colors hover:bg-background/80"
              aria-label={t("teacherAi.close", lang)}
            >
              <Icons.X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!minimized ? (
          <>
            <div className="flex-1 overflow-hidden bg-background px-5 py-5">
              <div className="h-full space-y-3 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {chatMessages.map((entry) => (
                    <div
                      key={entry.id}
                      className={
                        entry.role === "user"
                          ? "ml-10 rounded-2xl bg-primary px-5 py-4 text-base leading-6 text-primary-foreground"
                          : `mr-10 rounded-2xl px-5 py-4 text-base leading-6 ${entry.tone === "warning"
                            ? "bg-amber-100 text-amber-900"
                            : entry.tone === "muted"
                              ? "bg-muted text-muted-foreground"
                              : "bg-muted text-foreground"
                          }`
                      }
                    >
                      {entry.text}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={task === "generate_questions" ? "default" : "outline"}
                      onClick={() => switchTask("generate_questions")}
                    >
                      {t("teacherAi.action.generate", lang)}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={task === "suggest_similar_questions" ? "default" : "outline"}
                      onClick={() => switchTask("suggest_similar_questions")}
                    >
                      {t("teacherAi.action.suggest", lang)}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdvanced((current) => !current)}>
                      {showAdvanced ? t("teacherAi.action.hideOptions", lang) : t("teacherAi.action.moreOptions", lang)}
                    </Button>
                  </div>

                  {showAdvanced ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t("teacherAi.questionType", lang)}</div>
                        <select
                          value={questionType}
                          onChange={(e) => setQuestionType(e.target.value as typeof questionType)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="single_choice">{t("teacherAi.questionType.single", lang)}</option>
                          <option value="multiple_choice">{t("teacherAi.questionType.multiple", lang)}</option>
                          <option value="mixed">{t("teacherAi.questionType.mixed", lang)}</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t("teacherAi.difficulty", lang)}</div>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="easy">{t("questionBank.difficulty.easy", lang)}</option>
                          <option value="medium">{t("questionBank.difficulty.medium", lang)}</option>
                          <option value="hard">{t("questionBank.difficulty.hard", lang)}</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t("teacherAi.language", lang)}</div>
                        <Input
                          value={language}
                          onChange={(e) => {
                            userEditedLanguageRef.current = true;
                            setLanguage(e.target.value);
                          }}
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t("teacherAi.count", lang)}</div>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={count}
                          onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">{t("teacherAi.tags", lang)}</div>
                        <Input
                          value={tagsText}
                          onChange={(e) => setTagsText(e.target.value)}
                          placeholder={t("teacherAi.tagsPlaceholder", lang)}
                        />
                      </div>
                    </div>
                  ) : null}

                  {task === "suggest_similar_questions" ? (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("teacherAi.sourceQuestion", lang)}</div>
                      <Textarea
                        value={sourceQuestionText}
                        onChange={(e) => setSourceQuestionText(e.target.value)}
                        rows={3}
                        placeholder={t("teacherAi.sourceQuestionPlaceholder", lang)}
                      />
                    </div>
                  ) : null}

                  {message ? (
                    <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">{message}</div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-border bg-card px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-foreground">{t("teacherAi.previewTitle", lang)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {items.length > 0
                          ? t("teacherAi.readyCount", { count: items.length }, lang)
                          : t("teacherAi.noGeneratedYet", lang)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {aiModel ? <Badge variant="outline">{aiModel}</Badge> : null}
                      {aiProvider ? (
                        <Badge variant="outline">
                          {aiProvider === "local-fallback" ? t("teacherAi.providerFallback", lang) : t("teacherAi.providerGemini", lang)}
                        </Badge>
                      ) : null}
                      <Badge variant="secondary">{t("teacherAi.selectedCount", { count: selectedCount }, lang)}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 max-h-[25vh] space-y-3 overflow-y-auto pr-1">
                    {items.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-base text-muted-foreground">
                        {t("teacherAi.generatedWillAppear", lang)}
                      </div>
                    ) : (
                      items.map((item, index) => {
                        const correctIndexes = item.options
                          .filter((option) => option.is_correct)
                          .map((option) => option.order_index + 1)
                          .join(", ");
                        return (
                          <div key={`${item.text}-${index}`} className="rounded-xl border border-border p-4">
                            <div className="flex items-start gap-3">
                              <input
                                className="mt-1 h-4 w-4"
                                type="checkbox"
                                checked={!!selected[index]}
                                onChange={(e) => toggleSelected(index, e.target.checked)}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-base font-medium text-foreground leading-6">{item.text}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge variant="secondary">
                                    {item.question_type === "single_choice"
                                      ? t("teacherAi.questionType.single", lang)
                                      : t("teacherAi.questionType.multiple", lang)}
                                  </Badge>
                                  <Badge variant="outline">{t(`questionBank.difficulty.${item.difficulty}`, lang)}</Badge>
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  {item.options.map((option) => (
                                    <div key={`${option.order_index}-${option.text}`}>
                                      {option.order_index + 1}. {option.text}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {t("teacherAi.correct", lang)}: {correctIndexes}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-card px-5 py-5">
              <Textarea
                value={prompt}
                onChange={(e) => {
                  userEditedPromptRef.current = true;
                  setPrompt(e.target.value);
                }}
                rows={3}
                placeholder={t("teacherAi.promptPlaceholder", lang)}
                className="resize-none rounded-2xl border-border text-base"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">{t("teacherAi.previewHint", lang)}</div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => void saveSelected()} disabled={saving || items.length === 0}>
                    {saving ? t("common.saving", lang) : t("teacherAi.action.saveSelected", lang)}
                  </Button>
                  <Button type="button" onClick={() => void handleGenerate()} disabled={loading || saving}>
                    {loading ? t("teacherAi.generating", lang) : t("teacherAi.action.send", lang)}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card px-4 py-4 text-sm text-muted-foreground">{t("teacherAi.minimizedHint", lang)}</div>
        )}
      </div>
    </div>
  );
}
