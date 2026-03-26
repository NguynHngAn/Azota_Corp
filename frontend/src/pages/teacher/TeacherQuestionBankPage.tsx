import { useEffect, useId, useMemo, useState } from "react";
import {
  createBankQuestion,
  deleteBankQuestion,
  getBankQuestion,
  listBankQuestions,
  updateBankQuestion,
  type BankAnswerOptionCreate,
  type BankQuestionCreate,
  type BankQuestionListItem,
  type BankQuestionResponse,
  type QuestionDifficulty,
  type QuestionType,
} from "@/services/questionBank.service";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/layouts/icons";

export function TeacherQuestionBankPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BankQuestionListItem[]>([]);
  const [total, setTotal] = useState(0);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BankQuestionCreate>({
    question_type: "single_choice",
    text: "",
    explanation: "",
    difficulty: "medium",
    is_active: true,
    options: [
      { order_index: 0, text: "", is_correct: true },
      { order_index: 1, text: "", is_correct: false },
    ],
    tags: [],
  });
  const [tagsText, setTagsText] = useState("");
  const questionTextFieldId = useId();
  const explanationFieldId = useId();

  const normalizedTags = useMemo(() => {
    return tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);
  }, [tagsText]);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await listBankQuestions(token, { q: query.trim() || undefined, limit: 50, offset: 0 });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load question bank");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function openCreate() {
    setEditingId(null);
    setDraft({
      question_type: "single_choice",
      text: "",
      explanation: "",
      difficulty: "medium",
      is_active: true,
      options: [
        { order_index: 0, text: "", is_correct: true },
        { order_index: 1, text: "", is_correct: false },
      ],
      tags: [],
    });
    setTagsText("");
    setEditorOpen(true);
  }

  async function openEdit(id: number) {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const res: BankQuestionResponse = await getBankQuestion(id, token);
      setEditingId(id);
      setDraft({
        question_type: res.question_type,
        text: res.text,
        explanation: res.explanation ?? "",
        difficulty: res.difficulty,
        is_active: res.is_active,
        options: res.options
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((o) => ({ order_index: o.order_index, text: o.text, is_correct: o.is_correct })),
        tags: res.tags ?? [],
      });
      setTagsText((res.tags ?? []).join(", "));
      setEditorOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load question");
    } finally {
      setSaving(false);
    }
  }

  function setQuestionType(question_type: QuestionType) {
    setDraft((d) => {
      if (question_type === d.question_type) return d;
      const correctCount = d.options.filter((o) => o.is_correct).length;
      let options = [...d.options];
      if (question_type === "single_choice" && correctCount !== 1) {
        const firstCorrect = options.findIndex((o) => o.is_correct);
        options = options.map((o, i) => ({ ...o, is_correct: firstCorrect >= 0 ? i === firstCorrect : i === 0 }));
      }
      return { ...d, question_type, options };
    });
  }

  function setOptionCorrect(index: number, checked: boolean) {
    setDraft((d) => {
      const options = d.options.map((o, i) => {
        if (d.question_type === "single_choice") return { ...o, is_correct: i === index };
        return i === index ? { ...o, is_correct: checked } : o;
      });
      return { ...d, options };
    });
  }

  function addOption() {
    setDraft((d) => ({
      ...d,
      options: [...d.options, { order_index: d.options.length, text: "", is_correct: false }],
    }));
  }

  function removeOption(index: number) {
    setDraft((d) => {
      const next = d.options.filter((_, i) => i !== index).map((o, i) => ({ ...o, order_index: i }));
      if (next.length < 2) return d;
      if (d.question_type === "single_choice" && next.filter((o) => o.is_correct).length !== 1) {
        next[0] = { ...next[0], is_correct: true };
        for (let i = 1; i < next.length; i++) next[i] = { ...next[i], is_correct: false };
      }
      return { ...d, options: next };
    });
  }

  function validateDraft(): string | null {
    const text = draft.text.trim();
    if (!text) return "Question text is required.";
    const opts = draft.options.map((o) => ({ ...o, text: o.text.trim() })).filter((o) => o.text.length > 0);
    if (opts.length < 2) return "At least 2 answer options are required.";
    const correctCount = opts.filter((o) => o.is_correct).length;
    if (draft.question_type === "single_choice" && correctCount !== 1) return "Single choice must have exactly 1 correct option.";
    if (draft.question_type === "multiple_choice" && correctCount < 1) return "Multiple choice must have at least 1 correct option.";
    return null;
  }

  async function save() {
    const msg = validateDraft();
    if (msg) {
      setError(msg);
      return;
    }
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const payload: BankQuestionCreate = {
        ...draft,
        text: draft.text.trim(),
        explanation: draft.explanation?.trim() || null,
        tags: normalizedTags,
        options: draft.options.map((o, i) => ({ ...o, order_index: i, text: o.text.trim() })) as BankAnswerOptionCreate[],
      };
      if (editingId == null) await createBankQuestion(payload, token);
      else await updateBankQuestion(editingId, payload, token);
      setEditorOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: number) {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await deleteBankQuestion(id, token);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  function difficultyLabel(d: QuestionDifficulty) {
    if (d === "easy") return "Easy";
    if (d === "hard") return "Hard";
    return "Medium";
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">{loading ? "Loading..." : `${total} questions total`}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refresh()} disabled={loading || saving}>
            Refresh
          </Button>
          <Button onClick={openCreate} disabled={saving}>
            <Icons.Plus className="size-4" /> New Question
          </Button>
        </div>
      </div>

      <div >
        <div className="search-input max-w-md">
          <Icons.Search className="size-4" />
          <input
            type="text"
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void refresh();
            }}
          />
        </div>
        {error ? <div className="mt-4 text-sm text-muted-foreground">{error}</div> : null}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Icons.Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">No questions found.</div>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="max-w-[520px]">
                      <div className="font-medium text-muted-foreground line-clamp-2">{it.text}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {it.question_type === "single_choice" ? "Single" : "Multiple"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          it.difficulty === "easy" ? "default" : it.difficulty === "hard" ? "destructive" : "secondary"
                        }
                      >
                        {difficultyLabel(it.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={it.is_active ? "default" : "outline"}>{it.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(it.tags ?? []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
                        ))}
                        {(it.tags ?? []).length > 3 ? (
                          <span className="text-xs text-muted-foreground">+{(it.tags ?? []).length - 3}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(it.id)} disabled={saving}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete question?\n\nThis will permanently remove the question from your bank.",
                              )
                            ) {
                              void doDelete(it.id);
                            }
                          }}
                          disabled={saving}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {editorOpen && (
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {editingId == null ? "New question" : `Edit question #${editingId}`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Changes are saved to your personal question bank.</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setEditorOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              <div>
                <label htmlFor={questionTextFieldId} className="block text-xs font-medium text-muted-foreground mb-1">
                  Question text *
                </label>
                <Textarea
                  id={questionTextFieldId}
                  value={draft.text}
                  onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor={explanationFieldId} className="block text-xs font-medium text-muted-foreground mb-1">
                  Explanation (optional)
                </label>
                <Textarea
                  id={explanationFieldId}
                  value={draft.explanation ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="rounded-2xl border border-border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground">Answer options</div>
                  <Button size="sm" variant="ghost" onClick={addOption} type="button">
                    + Add option
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  {draft.options.map((o, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        className="h-4 w-4"
                        type={draft.question_type === "single_choice" ? "radio" : "checkbox"}
                        name={draft.question_type === "single_choice" ? "bank-q-correct" : undefined}
                        checked={o.is_correct}
                        onChange={(e) => setOptionCorrect(idx, e.target.checked)}
                      />
                      <div className="flex-1">
                        <Input
                          value={o.text}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              options: d.options.map((x, i) => (i === idx ? { ...x, text: e.target.value } : x)),
                            }))
                          }
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => removeOption(idx)}
                        disabled={draft.options.length <= 2}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                <select
                  value={draft.question_type}
                  onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="single_choice">Single choice</option>
                  <option value="multiple_choice">Multiple choice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Difficulty</label>
                <select
                  value={draft.difficulty}
                  onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value as QuestionDifficulty }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                <select
                  value={draft.is_active ? "active" : "inactive"}
                  onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.value === "active" }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="e.g. algebra, grade 9" />
                {normalizedTags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {normalizedTags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

