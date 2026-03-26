import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import {
  getExam,
  updateExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  type ExamDetail,
} from "@/services/exams.service";
import { addFromBankToExam, listBankQuestions, type BankQuestionListItem } from "@/services/questionBank.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ExamFormState } from "@/pages/exams/types";
import { validateExamForm } from "@/pages/exams/types";
import { ExamEditorForm } from "@/pages/exams/ExamEditorForm";

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
  const location = useLocation();
  const examId = id ? parseInt(id, 10) : NaN;
  const [state, setState] = useState<ExamFormState | null>(null);
  const [originalQuestionIds, setOriginalQuestionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState("");
  const [bankQuery, setBankQuery] = useState("");
  const [bankItems, setBankItems] = useState<BankQuestionListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bankAutoOpened, setBankAutoOpened] = useState(false);

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

  useEffect(() => {
    if (!token) return;
    if (loading) return;
    if (bankAutoOpened) return;
    const params = new URLSearchParams(location.search);
    if (params.get("openBank") !== "1") return;
    setBankAutoOpened(true);
    setBankOpen(true);
    void loadBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankAutoOpened, loading, location.search, token]);

  async function loadBank() {
    if (!token) return;
    setBankLoading(true);
    setBankError("");
    try {
      const res = await listBankQuestions(token, { q: bankQuery.trim() || undefined, limit: 50, offset: 0, is_active: true });
      setBankItems(res.items);
    } catch (e) {
      setBankError(e instanceof Error ? e.message : "Failed to load question bank");
      setBankItems([]);
    } finally {
      setBankLoading(false);
    }
  }

  async function importSelected() {
    if (!token) return;
    if (selectedIds.length === 0) return;
    setBankLoading(true);
    setBankError("");
    try {
      await addFromBankToExam(examId, selectedIds, token);
      const exam = await getExam(examId, token);
      setState(examToFormState(exam));
      setOriginalQuestionIds(exam.questions.map((q) => q.id));
      setBankOpen(false);
      setSelectedIds([]);
    } catch (e) {
      setBankError(e instanceof Error ? e.message : "Failed to import questions");
    } finally {
      setBankLoading(false);
    }
  }

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
        onAddFromBank={() => {
          setBankOpen(true);
          void loadBank();
        }}
        onSave={handleSave}
        saving={submitting}
        saveLabel="Save exam"
      />

      {bankOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card text-foreground rounded-2xl shadow-lg w-full max-w-3xl p-5 border border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Add from Question Bank</div>
                <div className="text-xs text-slate-500 mt-1">Select questions to copy into this exam (snapshot).</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setBankOpen(false)} disabled={bankLoading}>
                  Cancel
                </Button>
                <Button onClick={importSelected} disabled={bankLoading || selectedIds.length === 0}>
                  {bankLoading ? "Adding..." : `Add (${selectedIds.length})`}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search bank questions..."
                  value={bankQuery}
                  onChange={(e) => setBankQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void loadBank();
                  }}
                />
              </div>
              <Button variant="secondary" onClick={loadBank} disabled={bankLoading}>
                Search
              </Button>
            </div>

            {bankError ? <div className="mt-3 text-sm text-rose-700">{bankError}</div> : null}

            <Card className="mt-4 border border-border shadow-sm hover:shadow-sm">
              {bankLoading ? (
                <div className="space-y-3">
                  <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-slate-50 animate-pulse" />
                </div>
              ) : bankItems.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">No questions found.</div>
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead />
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankItems.map((it) => {
                        const checked = selectedIds.includes(it.id);
                        return (
                          <TableRow key={it.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={checked}
                                onChange={(e) => {
                                  const next = e.target.checked;
                                  setSelectedIds((prev) =>
                                    next ? Array.from(new Set([...prev, it.id])) : prev.filter((x) => x !== it.id),
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell className="max-w-[520px]">
                              <div className="font-medium text-slate-900 line-clamp-2">{it.text}</div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                              {it.question_type === "single_choice" ? "Single" : "Multiple"}
                            </TableCell>
                            <TableCell className="text-slate-700">{it.difficulty}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
