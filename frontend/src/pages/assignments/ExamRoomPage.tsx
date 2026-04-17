import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useExam } from "@/context";
import {
  startAssignment,
  submitSubmission,
  saveSubmissionAnswers,
  getMySubmissionForAssignment,
  type ExamRoomQuestion,
  type SubmissionStartResponse,
} from "@/services/assignments.service";
import { useFullScreen } from "@/hooks/useFullScreen";
import { useTabVisibility } from "@/hooks/useTabVisibility";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logAntiCheatEvent, sendAntiCheatHeartbeat, type AntiCheatEventCreate } from "@/services/antiCheat.service";
import { t, useLanguage } from "@/i18n";

const AUTOSAVE_DEBOUNCE_MS = 750;
const AUTOSAVE_INTERVAL_MS = 12000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamRoomPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { startExam } = useExam();
  const lang = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmittedSubmissionId, setAlreadySubmittedSubmissionId] = useState<number | null>(null);
  const [checkingAttempt, setCheckingAttempt] = useState(false);
  const [room, setRoom] = useState<SubmissionStartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitTriggered = useRef(false);

  // Anti-cheat
  const { isFullScreen, requestFullScreen, exitFullScreen } = useFullScreen();
  const { isVisible } = useTabVisibility();
  const [examStarted, setExamStarted] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [integrityDegraded, setIntegrityDegraded] = useState(false);
  const lastOkRef = useRef<boolean>(true);
  const lastViolationAtRef = useRef<number>(0);
  const lastTextSelectionLogAt = useRef(0);
  const lastDevtoolsLogAt = useRef(0);
  const autosaveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const antiCheatRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const antiCheatRetryDelayMsRef = useRef(2000);
  const antiCheatQueueRef = useRef<AntiCheatEventCreate[]>([]);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const scheduleAntiCheatRetry = useCallback(() => {
    if (antiCheatRetryRef.current) return;
    antiCheatRetryRef.current = setTimeout(() => {
      antiCheatRetryRef.current = null;
      antiCheatRetryDelayMsRef.current = Math.min(30_000, antiCheatRetryDelayMsRef.current * 2);
      if (!token || antiCheatQueueRef.current.length === 0) return;
      const queue = [...antiCheatQueueRef.current];
      antiCheatQueueRef.current = [];
      for (const event of queue) {
        void logAntiCheatEvent(event, token).catch(() => {
          antiCheatQueueRef.current.push(event);
        });
      }
      if (antiCheatQueueRef.current.length === 0) {
        antiCheatRetryDelayMsRef.current = 2000;
        setIntegrityDegraded(false);
      } else {
        scheduleAntiCheatRetry();
      }
    }, antiCheatRetryDelayMsRef.current);
  }, [token]);

  const logAntiCheatEventReliable = useCallback(
    (event: AntiCheatEventCreate) => {
      if (!token) return;
      void logAntiCheatEvent(event, token).catch(() => {
        antiCheatQueueRef.current.push(event);
        if (antiCheatQueueRef.current.length >= 3) setIntegrityDegraded(true);
        scheduleAntiCheatRetry();
      });
    },
    [token, scheduleAntiCheatRetry],
  );

  const flushAutosave = useCallback(async () => {
    if (!room || !token || !examStarted || submitting || autoSubmitTriggered.current) return;
    const currentAnswers = answersRef.current;
    const payload = {
      answers: room.questions.map((q: ExamRoomQuestion) => ({
        question_id: q.id,
        chosen_option_ids: currentAnswers[q.id] ?? [],
      })),
    };
    try {
      await saveSubmissionAnswers(room.submission_id, payload, token);
    } catch {
      // best-effort; avoid blocking the exam UI
    }
  }, [room, token, examStarted, submitting]);

  const scheduleAutosave = useCallback(() => {
    if (!room || !examStarted || submitting || autoSubmitTriggered.current) return;
    if (autosaveDebounceRef.current) clearTimeout(autosaveDebounceRef.current);
    autosaveDebounceRef.current = setTimeout(() => {
      autosaveDebounceRef.current = null;
      void flushAutosave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [room, examStarted, submitting, flushAutosave]);

  const doSubmit = useCallback(async () => {
    if (!room || !token || autoSubmitTriggered.current) return;
    autoSubmitTriggered.current = true;
    setSubmitting(true);
    const currentAnswers = answersRef.current;
    const isTimeOut = remainingMs !== null && remainingMs <= 0;
    const payload = {
      answers: room.questions.map((q: ExamRoomQuestion) => ({
        question_id: q.id,
        chosen_option_ids: currentAnswers[q.id] ?? [],
      })),
      submit_reason: isTimeOut ? "time_limit_reached" : "manual_submit",
    };
    try {
      await submitSubmission(room.submission_id, payload, token);
      // Best-effort log with retry queue.
      logAntiCheatEventReliable({
        assignment_id: room.assignment_id,
        submission_id: room.submission_id,
        event_type: "EXAM_SUBMIT",
      });
      await exitFullScreen();
      navigate(`/student/assignments/result/${room.submission_id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("examRoom.submitFailed", lang));
      autoSubmitTriggered.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [room, token, navigate, exitFullScreen, remainingMs, lang, logAntiCheatEventReliable]);

  const checkSubmittedAttempt = useCallback(
    async (id: number): Promise<number | null> => {
      if (!token) return null;
      try {
        const mine = await getMySubmissionForAssignment(id, token);
        return mine.submission_id;
      } catch {
        return null;
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token || !assignmentId || room) return;
    const id = parseInt(assignmentId, 10);
    if (Number.isNaN(id)) return;
    let cancelled = false;
    setCheckingAttempt(true);
    void checkSubmittedAttempt(id)
      .then((submissionId) => {
        if (cancelled) return;
        setAlreadySubmittedSubmissionId(submissionId);
      })
      .finally(() => {
        if (!cancelled) setCheckingAttempt(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, assignmentId, room, checkSubmittedAttempt]);

  const handleStartExam = useCallback(async () => {
    if (!token || !assignmentId || submitting || autoSubmitTriggered.current) return;
    const id = parseInt(assignmentId, 10);
    if (Number.isNaN(id)) {
      setError(t("examRoom.invalidAssignment", lang));
      return;
    }

    setCheckingAttempt(true);
    const submittedId = await checkSubmittedAttempt(id);
    setCheckingAttempt(false);
    if (submittedId) {
      setAlreadySubmittedSubmissionId(submittedId);
      await exitFullScreen().catch(() => {});
      navigate(`/student/assignments/result/${submittedId}`, { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    try {
      // 1. Fullscreen first
      const entered = await requestFullScreen();
      if (!entered) {
        setError(t("examRoom.fullscreenRequired", lang));
        return;
      }
      lastOkRef.current = true;

      // 2. Call API
      const data = await startAssignment(id, token);
      setRoom(data);

      // 3. Deadline: prefer server field, else started_at + duration
      const endTime = data.deadline_at
        ? new Date(data.deadline_at).getTime()
        : Date.parse(data.started_at) + data.duration_minutes * 60_000;
      setRemainingMs(Math.max(0, endTime - Date.now()));

      // 4. Restore saved answers (HEAD giữ lại)
      const initial: Record<number, number[]> = {};
      for (const row of data.saved_answers ?? []) {
        initial[row.question_id] = [...row.chosen_option_ids];
      }
      setAnswers(initial);
      answersRef.current = initial;

      // 5. Start exam
      startExam({ assignmentId: data.assignment_id, submissionId: data.submission_id });
      setExamStarted(true);

      // 6. Anti-cheat log
      logAntiCheatEventReliable({
        assignment_id: data.assignment_id,
        submission_id: data.submission_id,
        event_type: "EXAM_START",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("examRoom.failedStart", lang);
      setError(msg);
      const mineId = await checkSubmittedAttempt(id);
      setAlreadySubmittedSubmissionId(mineId);
      await exitFullScreen().catch(() => { });
    } finally {
      setLoading(false);
    }
  }, [token, assignmentId, submitting, requestFullScreen, startExam, exitFullScreen, lang, logAntiCheatEventReliable, checkSubmittedAttempt, navigate]);

  useEffect(() => {
    if (remainingMs === null || !room) return;
    if (remainingMs <= 0) {
      doSubmit();
      return;
    }
    const t = setInterval(() => {
      const endTime = room.deadline_at
        ? new Date(room.deadline_at).getTime()
        : new Date(room.started_at).getTime() + room.duration_minutes * 60 * 1000;
      const next = Math.max(0, endTime - Date.now());
      setRemainingMs(next);
      if (next <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [remainingMs, room, doSubmit]);

  useEffect(() => {
    return () => {
      if (autosaveDebounceRef.current) clearTimeout(autosaveDebounceRef.current);
      if (antiCheatRetryRef.current) clearTimeout(antiCheatRetryRef.current);
    };
  }, []);

  useEffect(() => {
    if (!room || !token || !examStarted || submitting) return;
    const intervalId = window.setInterval(() => {
      void flushAutosave();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [room, token, examStarted, submitting, flushAutosave]);

  useEffect(() => {
    if (!room || !token || !examStarted || submitting || autoSubmitTriggered.current) return;
    let consecutiveFailures = 0;
    const HEARTBEAT_INTERVAL_MS = 15_000;
    const intervalId = window.setInterval(() => {
      void sendAntiCheatHeartbeat(
        { assignment_id: room.assignment_id, submission_id: room.submission_id },
        token,
      )
        .then(() => {
          consecutiveFailures = 0;
        })
        .catch(() => {
          consecutiveFailures += 1;
          if (consecutiveFailures >= 3) {
            setViolationMessage(t("examRoom.violationMessage", { maxViolations: room.max_violations }, lang));
            setShowViolationModal(true);
          }
        });
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [room, token, examStarted, submitting, lang]);

  useEffect(() => {
    if (!room || !token || !examStarted || submitting) return;
    const base = { assignment_id: room.assignment_id, submission_id: room.submission_id };
    const log = (event_type: string, meta?: Record<string, unknown>) => {
      logAntiCheatEventReliable({ ...base, event_type, meta });
    };
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onCopy = (e: ClipboardEvent) => {
      block(e);
      log("COPY_ATTEMPT");
    };
    const onCut = (e: ClipboardEvent) => {
      block(e);
      log("CUT_ATTEMPT");
    };
    const onPaste = (e: ClipboardEvent) => {
      block(e);
      log("PASTE_ATTEMPT");
    };
    const onContextMenu = (e: MouseEvent) => {
      block(e);
      log("CONTEXT_MENU", { clientX: e.clientX, clientY: e.clientY });
    };
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCut, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("contextmenu", onContextMenu, true);
    return () => {
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCut, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
    };
  }, [room, token, examStarted, submitting, logAntiCheatEventReliable]);

  useEffect(() => {
    if (!room || !token || !examStarted || submitting) return;
    const base = { assignment_id: room.assignment_id, submission_id: room.submission_id };
    let timer: ReturnType<typeof setTimeout> | null = null;
    const TEXT_SELECTION_DEBOUNCE_MS = 650;
    const TEXT_SELECTION_LOG_COOLDOWN_MS = 4000;
    const MIN_SELECTION_LEN = 3;

    const flush = () => {
      timer = null;
      const text = window.getSelection()?.toString().trim() ?? "";
      if (text.length < MIN_SELECTION_LEN) return;
      const now = Date.now();
      if (now - lastTextSelectionLogAt.current < TEXT_SELECTION_LOG_COOLDOWN_MS) return;
      lastTextSelectionLogAt.current = now;
      logAntiCheatEventReliable({ ...base, event_type: "TEXT_SELECTION", meta: { length: text.length } });
    };
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, TEXT_SELECTION_DEBOUNCE_MS);
    };
    document.addEventListener("mouseup", schedule);
    document.addEventListener("keyup", schedule);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("mouseup", schedule);
      document.removeEventListener("keyup", schedule);
    };
  }, [room, token, examStarted, submitting, logAntiCheatEventReliable]);

  useEffect(() => {
    if (!room || !token || !examStarted || submitting) return;
    const THRESH_PX = 120;
    const COOLDOWN_MS = 25000;
    const iv = window.setInterval(() => {
      if (autoSubmitTriggered.current) return;
      const w = window.outerWidth - window.innerWidth;
      const h = window.outerHeight - window.innerHeight;
      if (w < THRESH_PX && h < THRESH_PX) return;
      const now = Date.now();
      if (now - lastDevtoolsLogAt.current < COOLDOWN_MS) return;
      lastDevtoolsLogAt.current = now;
      logAntiCheatEventReliable({
        assignment_id: room.assignment_id,
        submission_id: room.submission_id,
        event_type: "DEVTOOLS_DETECTED",
        meta: { diffOuterInnerW: w, diffOuterInnerH: h },
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [room, token, examStarted, submitting, logAntiCheatEventReliable]);

  // Track fullscreen/tab visibility violations after exam started
  useEffect(() => {
    if (!room || !examStarted || !token) return;
    const ok = isFullScreen && isVisible;
    const wasOk = lastOkRef.current;

    if (wasOk && !ok && !submitting && !autoSubmitTriggered.current) {
      const now = Date.now();
      // Simple cooldown to avoid double logs from multiple events firing at once.
      if (now - lastViolationAtRef.current > 400) {
        lastViolationAtRef.current = now;
        const meta: Record<string, unknown> = {
          isFullScreen,
          isVisible,
          visibilityState: document.visibilityState,
          hasFocus: typeof document.hasFocus === "function" ? document.hasFocus() : undefined,
        };
        if (!isFullScreen) {
          void logAntiCheatEvent(
            { assignment_id: room.assignment_id, submission_id: room.submission_id, event_type: "FULLSCREEN_EXIT", meta },
            token,
          ).then(async (res) => {
            if (res?.auto_submitted) {
              autoSubmitTriggered.current = true;
              await exitFullScreen();
              navigate(`/student/assignments/result/${room.submission_id}`, { replace: true });
            }
          }).catch(() => {
            antiCheatQueueRef.current.push({
              assignment_id: room.assignment_id,
              submission_id: room.submission_id,
              event_type: "FULLSCREEN_EXIT",
              meta,
            });
            setIntegrityDegraded(true);
            scheduleAntiCheatRetry();
          });
        }
        if (!isVisible) {
          void logAntiCheatEvent(
            { assignment_id: room.assignment_id, submission_id: room.submission_id, event_type: "TAB_HIDDEN", meta },
            token,
          ).then(async (res) => {
            if (res?.auto_submitted) {
              autoSubmitTriggered.current = true;
              await exitFullScreen();
              navigate(`/student/assignments/result/${room.submission_id}`, { replace: true });
            }
          }).catch(() => {
            antiCheatQueueRef.current.push({
              assignment_id: room.assignment_id,
              submission_id: room.submission_id,
              event_type: "TAB_HIDDEN",
              meta,
            });
            setIntegrityDegraded(true);
            scheduleAntiCheatRetry();
          });
        }
      }
      setViolationMessage(t("examRoom.violationMessage", { maxViolations: room.max_violations }, lang));
      setShowViolationModal(true);
    }

    lastOkRef.current = ok;
  }, [isFullScreen, isVisible, room, examStarted, submitting, token, doSubmit, lang, scheduleAntiCheatRetry]);

  const setSingle = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: [optionId] };
      answersRef.current = next;
      return next;
    });
    scheduleAutosave();
  };

  const setMultiple = (questionId: number, optionId: number, checked: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const next = checked
        ? { ...prev, [questionId]: [...current, optionId] }
        : { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      answersRef.current = next;
      return next;
    });
    scheduleAutosave();
  };

  if (loading) return <p className="text-muted-foreground">{t("examRoom.loading", lang)}</p>;
  if (error && !room) {
    const already =
      error.toLowerCase().includes("already submitted") ||
      error.toLowerCase().includes("no attempts left");
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-sm p-4">
          <div className="text-lg font-semibold text-foreground">
            {already ? t("examRoom.alreadySubmitted", lang) : t("examRoom.unableToStart", lang)}
          </div>
          <div className="mt-2 text-base text-muted-foreground">
            {already
              ? t("examRoom.alreadySubmittedDesc", lang)
              : error}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/student/assignments")}>
              {t("examRoom.backToAssignments", lang)}
            </Button>
            {already && alreadySubmittedSubmissionId ? (
              <Button
                type="button"
                onClick={() => navigate(`/student/assignments/result/${alreadySubmittedSubmissionId}`)}
              >
                {t("examRoom.viewResult", lang)}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
  if (!room) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-4">
          <div className="text-lg font-semibold text-foreground">{t("examRoom.startTitle", lang)}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t(
              "examRoom.startDescription",
              {
                maxViolations: 3,
                maxAttempts: 1,
              },
              lang,
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/student/assignments")}>
              {t("common.cancel", lang)}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (alreadySubmittedSubmissionId) {
                  navigate(`/student/assignments/result/${alreadySubmittedSubmissionId}`);
                  return;
                }
                void handleStartExam();
              }}
              disabled={!token || loading || checkingAttempt}
            >
              {alreadySubmittedSubmissionId ? t("examRoom.viewResult", lang) : t("examRoom.enterFullscreen", lang)}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const sortedQuestions = [...room.questions].sort((a, b) => a.order_index - b.order_index);
  const isTimeUp = remainingMs !== null && remainingMs <= 0;

  const showStartOverlay = !examStarted;

  return (
    <div className="max-w-2xl mx-auto relative space-y-6">
      <Card className="mb-4 flex items-center justify-between p-4 rounded-lg">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{room.exam_title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("examRoom.fullscreenHint", lang)}
          </p>
        </div>
        <div
          className={`font-mono text-lg px-3 py-1 rounded-md ${remainingMs !== null && remainingMs <= 60 * 1000 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
            }`}
        >
          {remainingMs !== null ? formatCountdown(remainingMs) : "—"}
        </div>
      </Card>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}
      {integrityDegraded ? (
        <p className="text-warning text-sm mb-4">
          {t("examRoom.violationMessage", { maxViolations: room.max_violations }, lang)}
        </p>
      ) : null}

      {showStartOverlay && (
        <div className="fixed inset-0 bg-background/40 flex items-center justify-center z-50">
          <div className="bg-card rounded shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">{t("examRoom.startTitle", lang)}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t(
                "examRoom.startDescription",
                {
                  maxViolations: room.max_violations,
                  maxAttempts: room.max_attempts,
                },
                lang,
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate("/student/assignments")}>
                {t("common.cancel", lang)}
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const entered = await requestFullScreen();
                  if (!entered) {
                    setError(t("examRoom.fullscreenRequired", lang));
                    return;
                  }
                  lastOkRef.current = entered && isFullScreen && isVisible;
                  if (room) {
                    startExam({ assignmentId: room.assignment_id, submissionId: room.submission_id });
                  }
                  if (room && token) {
                    logAntiCheatEventReliable({
                      assignment_id: room.assignment_id,
                      submission_id: room.submission_id,
                      event_type: "EXAM_START",
                      meta: { enteredFullScreen: true },
                    });
                  }
                  setExamStarted(true);
                }}
              >
                {t("examRoom.enterFullscreen", lang)}
              </Button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSubmit();
        }}
        className="space-y-8"
      >
        {sortedQuestions.map((q, idx) => (
          <QuestionBlock
            key={q.id}
            question={q}
            index={idx + 1}
            chosenIds={answers[q.id] ?? []}
            onSingle={setSingle}
            onMultiple={setMultiple}
            disabled={isTimeUp || submitting}
          />
        ))}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isTimeUp || submitting}>
            {submitting ? t("examRoom.submitting", lang) : t("examRoom.submit", lang)}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/student/assignments")}
          >
            {t("examRoom.back", lang)}
          </Button>
        </div>
      </form>

      {showViolationModal && (
        <div className="fixed inset-0 bg-background/40 flex items-center justify-center z-50">
          <div className="bg-card rounded shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">{t("examRoom.warningTitle", lang)}</h3>
            <p className="text-sm text-muted-foreground mb-4">{violationMessage}</p>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  setShowViolationModal(false);
                  if (!isFullScreen) {
                    const entered = await requestFullScreen();
                    lastOkRef.current = entered && isFullScreen && isVisible;
                  }
                }}
              >
                {t("examRoom.understand", lang)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionBlock({
  question,
  index,
  chosenIds,
  onSingle,
  onMultiple,
  disabled,
}: {
  question: ExamRoomQuestion;
  index: number;
  chosenIds: number[];
  onSingle: (questionId: number, optionId: number) => void;
  onMultiple: (questionId: number, optionId: number, checked: boolean) => void;
  disabled: boolean;
}) {
  const lang = useLanguage();
  const isSingle = question.question_type === "single_choice";
  const sortedOptions = [...question.options].sort((a, b) => a.order_index - b.order_index);

  return (
    <fieldset className="p-2 bg-card rounded shadow" disabled={disabled}>
      <div className="text-lg font-semibold text-muted-foreground mb-4">
        {t("examRoom.question", { number: index }, lang)}: {question.text}
      </div>
      <div className="space-y-2">
        {sortedOptions.map((opt) => (
          <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
            {isSingle ? (
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={chosenIds.includes(opt.id)}
                onChange={() => onSingle(question.id, opt.id)}
                className="mt-1"
              />
            ) : (
              <input
                type="checkbox"
                checked={chosenIds.includes(opt.id)}
                onChange={(e) => onMultiple(question.id, opt.id, e.target.checked)}
                className="mt-1"
              />
            )}
            <span className="text-muted-foreground">{opt.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
