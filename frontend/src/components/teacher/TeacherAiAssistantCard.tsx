import { useMemo, useState } from "react";
import { MessageCircle, Minus, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

type SelectionMap = Record<number, boolean>;
type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  tone?: "default" | "muted" | "warning";
};

const defaultPrompts: Record<TeacherAITask, string> = {
  generate_questions: "Tao 10 cau hoi ve so nguyen to cho hoc sinh lop 6",
  suggest_similar_questions: "Goi y 5 cau tuong tu de luyen tap them",
};

export function TeacherAiAssistantCard() {
  const { token } = useAuth();
  const { success, error: showError } = useToast();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [task, setTask] = useState<TeacherAITask>("generate_questions");
  const [prompt, setPrompt] = useState(defaultPrompts.generate_questions);
  const [sourceQuestionText, setSourceQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"single_choice" | "multiple_choice" | "mixed">("single_choice");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [language, setLanguage] = useState("Vietnamese");
  const [count, setCount] = useState(5);
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiModel, setAiModel] = useState("");
  const [items, setItems] = useState<BankQuestionCreate[]>([]);
  const [selected, setSelected] = useState<SelectionMap>({});
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Xin chao. Toi la AI Assistant cho giao vien. Toi co the tao cau hoi moi hoac goi y cau hoi tuong tu.",
    },
    {
      id: "welcome-2",
      role: "assistant",
      text: 'Hay nhap yeu cau nhu: "Tao 5 cau single choice ve so nguyen to" hoac chuyen sang che do goi y cau tuong tu.',
      tone: "muted",
    },
  ]);

  const normalizedTags = useMemo(() => {
    return tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10);
  }, [tagsText]);

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
      setMessage("Prompt is required.");
      return null;
    }
    if (task === "suggest_similar_questions" && !sourceQuestionText.trim()) {
      setMessage("Source question text is required for similar suggestions.");
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
    if (!token) return;
    const body = buildRequest();
    if (!body) return;
    setLoading(true);
    setMessage("");
    setChatMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: body.prompt,
      },
    ]);
    try {
      const response = await generateTeacherAIQuestions(body, token);
      setAiModel(response.model);
      setItems(response.items);
      resetSelection(response.items);
      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text:
            response.provider === "local-fallback"
              ? `Gemini tam thoi khong kha dung, nen toi da tao ${response.items.length} cau hoi bang fallback local de ban tiep tuc thu nghiem.`
              : `Toi da tao ${response.items.length} cau hoi theo yeu cau cua ban. Ban co the xem preview va luu vao Question Bank.`,
          tone: response.provider === "local-fallback" ? "warning" : "default",
        },
        ...(response.note
          ? [
              {
                id: `assistant-note-${Date.now()}`,
                role: "assistant" as const,
                text: response.note,
                tone: "muted" as const,
              },
            ]
          : []),
      ]);
      if (response.items.length === 0) {
        setMessage("AI did not return any questions. Try a more specific prompt.");
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to generate AI suggestions";
      setMessage(text);
      showError({ title: "AI request failed", description: text });
      setItems([]);
      setSelected({});
      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
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
    const selectedItems = items.filter((_, index) => selected[index]);
    if (selectedItems.length === 0) {
      setMessage("Please select at least one question to save.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      for (const item of selectedItems) {
        await createBankQuestion(item, token);
      }
      success({
        title: "Saved to Question Bank",
        description: `${selectedItems.length} AI-generated question(s) were saved.`,
      });
      const remaining = items.filter((_, index) => !selected[index]);
      setItems(remaining);
      resetSelection(remaining);
      setChatMessages((current) => [
        ...current,
        {
          id: `assistant-save-${Date.now()}`,
          role: "assistant",
          text: `Da luu ${selectedItems.length} cau hoi vao Question Bank.`,
        },
      ]);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to save AI-generated questions";
      setMessage(text);
      showError({ title: "Save failed", description: text });
    } finally {
      setSaving(false);
    }
  }

  function switchTask(nextTask: TeacherAITask) {
    setTask(nextTask);
    setPrompt(defaultPrompts[nextTask]);
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
        aria-label="Open AI assistant"
      >
        <div className="flex flex-col items-center justify-center leading-none">
          <MessageCircle className="h-6 w-6" />
          <span className="mt-1 text-[10px] font-semibold">AI</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-[480px]">
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-none">AI Assistant</div>
              <div className="mt-1 text-xs text-primary-foreground/80">Teacher support for question generation</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMinimized((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
              aria-label={minimized ? "Expand AI assistant" : "Minimize AI assistant"}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Close AI assistant"
            >
              <X className="h-4 w-4" />
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
                          : `mr-10 rounded-2xl px-5 py-4 text-base leading-6 ${
                              entry.tone === "warning"
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
                      Generate questions
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={task === "suggest_similar_questions" ? "default" : "outline"}
                      onClick={() => switchTask("suggest_similar_questions")}
                    >
                      Suggest similar
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdvanced((current) => !current)}>
                      {showAdvanced ? "Hide options" : "More options"}
                    </Button>
                  </div>

                  {showAdvanced ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Question type</div>
                        <select
                          value={questionType}
                          onChange={(e) => setQuestionType(e.target.value as typeof questionType)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="single_choice">Single choice</option>
                          <option value="multiple_choice">Multiple choice</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Difficulty</div>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Language</div>
                        <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Count</div>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={count}
                          onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="mb-1 text-xs font-medium text-muted-foreground">Tags</div>
                        <Input
                          value={tagsText}
                          onChange={(e) => setTagsText(e.target.value)}
                          placeholder="math, grade 6, prime numbers"
                        />
                      </div>
                    </div>
                  ) : null}

                  {task === "suggest_similar_questions" ? (
                    <div className="mt-3">
                      <div className="mb-1 text-xs font-medium text-muted-foreground">Source question text</div>
                      <Textarea
                        value={sourceQuestionText}
                        onChange={(e) => setSourceQuestionText(e.target.value)}
                        rows={3}
                        placeholder="Paste the existing question here so AI can create similar items."
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
                      <div className="text-base font-semibold text-foreground">AI Preview</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {items.length > 0 ? `${items.length} question(s) ready` : "No generated questions yet"}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {aiModel ? <Badge variant="outline">{aiModel}</Badge> : null}
                      <Badge variant="outline">{aiModel === "local-fallback" ? "fallback local" : "gemini"}</Badge>
                      <Badge variant="secondary">{selectedCount} selected</Badge>
                    </div>
                  </div>

                  <div className="mt-3 max-h-[25vh] space-y-3 overflow-y-auto pr-1">
                    {items.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-base text-muted-foreground">
                        Generated questions will appear here for review before saving.
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
                                    {item.question_type === "single_choice" ? "Single choice" : "Multiple choice"}
                                  </Badge>
                                  <Badge variant="outline">{item.difficulty}</Badge>
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  {item.options.map((option) => (
                                    <div key={`${option.order_index}-${option.text}`}>
                                      {option.order_index + 1}. {option.text}
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">Correct: {correctIndexes}</div>
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
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Nhap yeu cau cho AI Assistant..."
                className="resize-none rounded-2xl border-border text-base"
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">Preview first, then save selected questions to Question Bank.</div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={() => void saveSelected()} disabled={saving || items.length === 0}>
                    {saving ? "Saving..." : "Save selected"}
                  </Button>
                  <Button type="button" onClick={() => void handleGenerate()} disabled={loading}>
                    {loading ? "Generating..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card px-4 py-4 text-sm text-muted-foreground">AI Assistant is minimized. Use the top controls to reopen the chat.</div>
        )}
      </div>
    </div>
  );
}
