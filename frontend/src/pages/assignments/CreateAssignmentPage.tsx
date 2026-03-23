import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listExams, type ExamResponse } from "@/services/exams.service";
import { listClasses, type ClassResponse } from "@/services/classes.service";
import { createAssignment, type AssignmentCreatePayload } from "@/services/assignments.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Assign exam to class</h2>
      <Card className="max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className={selectClass}
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
            className={selectClass}
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
          <Input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
          <Input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <Input
            type="number"
            min={1}
            max={600}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Assign"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`${base}/assignments`)}>
            Cancel
          </Button>
        </div>
        </form>
      </Card>
    </div>
  );
}
