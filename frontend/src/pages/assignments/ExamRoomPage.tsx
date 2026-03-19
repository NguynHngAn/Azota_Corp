import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useExam } from "../../context";
import {
  startAssignment,
  submitSubmission,
  getMySubmissionForAssignment,
  type ExamRoomQuestion,
  type SubmissionStartResponse,
} from "../../api/assignments";
import { useFullScreen } from "../../hooks/useFullScreen";
import { useTabVisibility } from "../../hooks/useTabVisibility";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { logAntiCheatEvent } from "../../api/antiCheat";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadySubmittedSubmissionId, setAlreadySubmittedSubmissionId] = useState<number | null>(null);
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
  const lastOkRef = useRef<boolean>(true);
  const lastViolationAtRef = useRef<number>(0);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const doSubmit = useCallback(async () => {
    if (!room || !token || autoSubmitTriggered.current) return;
    autoSubmitTriggered.current = true;
    setSubmitting(true);
    const currentAnswers = answersRef.current;
    const payload = {
      answers: room.questions.map((q) => ({
        question_id: q.id,
        chosen_option_ids: currentAnswers[q.id] ?? [],
      })),
    };
    try {
      await submitSubmission(room.submission_id, payload, token);
      // Best-effort log; do not block submit UX.
      void logAntiCheatEvent(
        {
          assignment_id: room.assignment_id,
          submission_id: room.submission_id,
          event_type: "EXAM_SUBMIT",
        },
        token,
      ).catch(() => {});
      await exitFullScreen();
      navigate(`/student/assignments/result/${room.submission_id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
      autoSubmitTriggered.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [room, token, navigate, exitFullScreen]);

  useEffect(() => {
    if (!token || !assignmentId) return;
    const id = parseInt(assignmentId, 10);
    if (Number.isNaN(id)) {
      setError("Invalid assignment");
      setLoading(false);
      return;
    }
    startAssignment(id, token)
      .then((data) => {
        setRoom(data);
        const endTime = new Date(data.started_at).getTime() + data.duration_minutes * 60 * 1000;
        setRemainingMs(Math.max(0, endTime - Date.now()));
      })
      .catch(async (e) => {
        const msg = e instanceof Error ? e.message : "Failed to start";
        setError(msg);
        if (msg.toLowerCase().includes("already submitted")) {
          try {
            const mine = await getMySubmissionForAssignment(id, token);
            setAlreadySubmittedSubmissionId(mine.submission_id);
          } catch {
            setAlreadySubmittedSubmissionId(null);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [token, assignmentId]);

  useEffect(() => {
    if (remainingMs === null || !room) return;
    if (remainingMs <= 0) {
      doSubmit();
      return;
    }
    const t = setInterval(() => {
      const endTime = new Date(room.started_at).getTime() + room.duration_minutes * 60 * 1000;
      const next = Math.max(0, endTime - Date.now());
      setRemainingMs(next);
      if (next <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [remainingMs, room, doSubmit]);

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
          ).catch(() => {});
        }
        if (!isVisible) {
          void logAntiCheatEvent(
            { assignment_id: room.assignment_id, submission_id: room.submission_id, event_type: "TAB_HIDDEN", meta },
            token,
          ).catch(() => {});
        }
      }
      setViolationMessage(
        "Bạn vừa thoát toàn màn hình hoặc chuyển tab. Nếu bạn vi phạm 3 lần, hệ thống sẽ tự động nộp bài.",
      );
      setShowViolationModal(true);
    }

    lastOkRef.current = ok;
  }, [isFullScreen, isVisible, room, examStarted, submitting, token, doSubmit]);

  const setSingle = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  };

  const setMultiple = (questionId: number, optionId: number, checked: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (checked) return { ...prev, [questionId]: [...current, optionId] };
      return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
    });
  };

  if (loading) return <p className="text-gray-600">Loading exam...</p>;
  if (error && !room) {
    const already = error.toLowerCase().includes("already submitted");
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border border-slate-100 shadow-sm hover:shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            {already ? "Already submitted" : "Unable to start exam"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {already
              ? "You have already submitted this exam. You can go back or view your result."
              : error}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/student/assignments")}>
              Back to assignments
            </Button>
            {already && alreadySubmittedSubmissionId ? (
              <Button
                type="button"
                onClick={() => navigate(`/student/assignments/result/${alreadySubmittedSubmissionId}`)}
              >
                View result
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }
  if (!room) return null;

  const sortedQuestions = [...room.questions].sort((a, b) => a.order_index - b.order_index);
  const isTimeUp = remainingMs !== null && remainingMs <= 0;

  const showStartOverlay = !examStarted;

  return (
    <div className="max-w-2xl mx-auto relative">
      <Card className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{room.exam_title}</h2>
          <p className="mt-1 text-xs text-gray-500">
            Please stay in fullscreen and do not switch tabs while taking the exam.
          </p>
        </div>
        <div
          className={`font-mono text-lg px-3 py-1 rounded-md ${
            remainingMs !== null && remainingMs <= 60 * 1000 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {remainingMs !== null ? formatCountdown(remainingMs) : "—"}
        </div>
      </Card>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {showStartOverlay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Bắt đầu làm bài</h3>
            <p className="text-sm text-gray-700 mb-4">
              Hệ thống sẽ bật chế độ toàn màn hình. Nếu bạn thoát full screen hoặc chuyển tab 3 lần, bài sẽ tự động
              được nộp.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/student/assignments")}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  await requestFullScreen();
                  lastOkRef.current = isFullScreen && isVisible;
                  if (room) {
                    startExam({ assignmentId: room.assignment_id, submissionId: room.submission_id });
                  }
                  if (room && token) {
                    void logAntiCheatEvent(
                      {
                        assignment_id: room.assignment_id,
                        submission_id: room.submission_id,
                        event_type: "EXAM_START",
                        meta: { enteredFullScreen: true },
                      },
                      token,
                    ).catch(() => {});
                  }
                  setExamStarted(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Vào full screen và bắt đầu
              </button>
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
            {submitting ? "Submitting..." : "Submit"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/student/assignments")}
          >
            Back
          </Button>
        </div>
      </form>

      {showViolationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Cảnh báo chống gian lận</h3>
            <p className="text-sm text-gray-800 mb-4">{violationMessage}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  setShowViolationModal(false);
                  if (!isFullScreen) {
                    await requestFullScreen();
                    lastOkRef.current = isFullScreen && isVisible;
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tôi hiểu
              </button>
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
  const isSingle = question.question_type === "single_choice";
  const sortedOptions = [...question.options].sort((a, b) => a.order_index - b.order_index);

  return (
    <fieldset className="p-4 bg-white rounded shadow" disabled={disabled}>
      <legend className="text-sm font-medium text-gray-700 mb-2">
        Question {index}: {question.text}
      </legend>
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
            <span className="text-gray-800">{opt.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
