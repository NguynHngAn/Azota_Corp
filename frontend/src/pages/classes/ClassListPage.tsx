import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listClasses, type ClassResponse } from "../../api/classes";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function ClassListPage() {
  const { token } = useAuth();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    listClasses(token)
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Classes</h2>
        <Link
          to={`${base}/classes/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create class
        </Link>
      </div>
      <ul className="space-y-2">
        {classes.length === 0 ? (
          <li className="text-gray-500">No classes yet.</li>
        ) : (
          classes.map((c) => (
            <li key={c.id}>
              <Link
                to={`${base}/classes/${c.id}`}
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
