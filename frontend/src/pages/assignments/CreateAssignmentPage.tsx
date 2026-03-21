import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { listExams, type ExamResponse } from "../../api/exams";
import { listClasses, type ClassResponse } from "../../api/classes";
import { createAssignment, type AssignmentCreatePayload } from "../../api/assignments";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

function toISOString(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  return new Date(datetimeLocal).toISOString();
}

export function CreateAssignmentPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [examId, setExamId] = useState<number | "">("");
  const [classId, setClassId] = useState<number | "">("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([listExams(token), listClasses(token)])
      .then(([examsList, classesList]) => {
        setExams(examsList);
        setClasses(classesList);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (examId === "" || classId === "") {
      setError("Please select exam and class");
      return;
    }
    const start = toISOString(startDateTime);
    const end = toISOString(endDateTime);
    if (!start || !end) {
      setError("Please set start and end time");
      return;
    }
    if (new Date(start) >= new Date(end)) {
      setError("Start time must be before end time");
      return;
    }
    if (durationMinutes < 1 || durationMinutes > 600) {
      setError("Duration must be between 1 and 600 minutes");
      return;
    }
    setSubmitting(true);
    if (!token) return;
    try {
      const body: AssignmentCreatePayload = {
        exam_id: examId as number,
        class_id: classId as number,
        start_time: start,
        end_time: end,
        duration_minutes: durationMinutes,
      };
      await createAssignment(body, token);
      navigate(`${base}/assignments`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Assign exam to class</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">-- Select exam --</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} {e.is_draft ? "(Draft)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">-- Select class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Assign"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`${base}/assignments`)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
