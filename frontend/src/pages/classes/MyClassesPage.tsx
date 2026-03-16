import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listMyClasses, type ClassResponse } from "../../api/classes";

export function MyClassesPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listMyClasses(token)
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My classes</h2>
      <ul className="space-y-2">
        {classes.length === 0 ? (
          <li className="text-gray-500">You are not in any class. Join one with an invite code.</li>
        ) : (
          classes.map((c) => (
            <li key={c.id}>
              <Link
                to={`/student/classes/${c.id}`}
                className="block p-3 bg-white rounded shadow hover:bg-gray-50"
              >
                <span className="font-medium">{c.name}</span>
                {c.description && <span className="text-gray-500 ml-2">— {c.description}</span>}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
