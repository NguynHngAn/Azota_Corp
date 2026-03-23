import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getClass, type ClassDetail } from "@/services/classes.service";

export function StudentClassDetailPage() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const classId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    getClass(classId, token)
      .then(setCls)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token, id, classId]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error || !cls) return <p className="text-red-600">{error || "Not found"}</p>;

  return (
    <div>
      <div className="mb-4">
        <Link to="/student/classes" className="text-blue-600 hover:underline">
          ← Back to my classes
        </Link>
      </div>
      <h2 className="text-lg font-semibold">{cls.name}</h2>
      {cls.description && <p className="text-gray-600 mt-1">{cls.description}</p>}
      <p className="text-sm text-gray-500 mt-2">Teacher: {cls.creator?.full_name ?? "—"}</p>
    </div>
  );
}
