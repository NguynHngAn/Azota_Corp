import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getSubmissionResult, type SubmissionResultResponse } from "../../api/assignments";
import { formatDateTimeVietnam } from "../../utils/date";
import { useExam } from "../../context";

export function SubmissionResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { finishExam } = useExam();
  const [data, setData] = useState<SubmissionResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !submissionId) return;
    const id = parseInt(submissionId, 10);
    if (Number.isNaN(id)) {
      setError("Invalid submission");
      setLoading(false);
      return;
    }
    getSubmissionResult(id, token)
      .then((res) => {
        setData(res);
        finishExam();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [token, submissionId, finishExam]);

  if (loading) return <p className="text-gray-600">Loading result...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  const correctCount = data.question_results.filter((r) => r.correct).length;
  const wrongCount = data.question_results.length - correctCount;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">{data.exam_title}</h2>
      <p className="text-sm text-gray-500 mb-6">
        Submitted at {data.submitted_at ? formatDateTimeVietnam(data.submitted_at) : "—"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-blue-600">{data.score ?? 0}</div>
          <div className="text-sm text-gray-600">Score (0–100)</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-green-600">{correctCount}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-red-600">{wrongCount}</div>
          <div className="text-sm text-gray-600">Wrong</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-2xl font-bold text-gray-700">{data.question_details.length}</div>
          <div className="text-sm text-gray-600">Total questions</div>
        </div>
      </div>

      <div className="space-y-6">
        {data.question_details.map((q, idx) => {
          const chosenTexts = q.options.filter((o) => q.chosen_option_ids.includes(o.id)).map((o) => o.text);
          const correctTexts = q.options.filter((o) => o.is_correct).map((o) => o.text);
          return (
            <div key={q.question_id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="font-medium text-gray-900">Question {idx + 1}: {q.question_text}</span>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded ${
                    q.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {q.correct ? "Correct" : "Wrong"}
                </span>
              </div>
              <div className="text-sm space-y-1 mt-2">
                <div>
                  <span className="text-gray-500">Your answer: </span>
                  {chosenTexts.length ? chosenTexts.join(", ") : "—"}
                </div>
                <div>
                  <span className="text-gray-500">Correct answer: </span>
                  {correctTexts.length ? correctTexts.join(", ") : "—"}
                </div>
                {q.ai_explanation && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="block text-gray-500 mb-1">AI explanation:</span>
                    <p className="text-gray-800 text-sm whitespace-pre-line">{q.ai_explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  );
}
