import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useExam } from "../../context";
import {
  startAssignment,
  submitSubmission,
  type ExamRoomQuestion,
  type SubmissionStartResponse,
} from "../../api/assignments";
import { useFullScreen } from "../../hooks/useFullScreen";
import { useTabVisibility } from "../../hooks/useTabVisibility";

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
  const [room, setRoom] = useState<SubmissionStartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitTriggered = useRef(false);

  // Anti-cheat
  const { isFullScreen, requestFullScreen, exitFullScreen } = useFullScreen();
  const { isVisible } = useTabVisibility();
  const [examStarted, setExamStarted] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [violationMessage, setViolationMessage] = useState("");
  const [showViolationModal, setShowViolationModal] = useState(false);
  const lastOkRef = useRef<boolean>(true);

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
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to start"))
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
    if (!room || !examStarted) return;
    const ok = isFullScreen && isVisible;
    const wasOk = lastOkRef.current;

    if (wasOk && !ok && !submitting && !autoSubmitTriggered.current) {
      setViolationCount((prev) => {
        const next = prev + 1;
        if (next < 3) {
          setViolationMessage(
            next === 1
              ? "Bạn vừa thoát toàn màn hình hoặc chuyển tab. Vui lòng quay lại full screen để tiếp tục làm bài."
              : "Bạn đã vi phạm lần 2 (thoát full screen / chuyển tab). Lần 3 hệ thống sẽ tự động nộp bài."
          );
          setShowViolationModal(true);
        } else {
          setViolationMessage("Bạn đã vi phạm 3 lần. Hệ thống sẽ tự động nộp bài.");
          setShowViolationModal(true);
          doSubmit();
        }
        return next;
      });
    }

    lastOkRef.current = ok;
  }, [isFullScreen, isVisible, room, examStarted, submitting, doSubmit]);

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
  if (error && !room) return <p className="text-red-600">{error}</p>;
  if (!room) return null;

  const sortedQuestions = [...room.questions].sort((a, b) => a.order_index - b.order_index);
  const isTimeUp = remainingMs !== null && remainingMs <= 0;

  const showStartOverlay = !examStarted;

  return (
    <div className="max-w-2xl mx-auto relative">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-lg font-semibold">{room.exam_title}</h2>
        <div
          className={`font-mono text-lg px-3 py-1 rounded ${
            remainingMs !== null && remainingMs <= 60 * 1000 ? "bg-red-100 text-red-800" : "bg-gray-100"
          }`}
        >
          {remainingMs !== null ? formatCountdown(remainingMs) : "—"}
        </div>
      </div>

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
          <button
            type="submit"
            disabled={isTimeUp || submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/student/assignments")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
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
