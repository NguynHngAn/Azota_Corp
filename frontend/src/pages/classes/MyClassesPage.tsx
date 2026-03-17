import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listMyClasses, type ClassResponse } from "../../api/classes";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";

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
    <div className="space-y-4">
      <PageHeader
        title="My classes"
        description="Classes you have joined as a student."
      />
      {classes.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">
            You are not in any class yet. Join one using an invite code.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id} className="hover:ring-1 hover:ring-blue-100 transition">
              <Link to={`/student/classes/${c.id}`} className="block">
                <h3 className="font-medium text-gray-900">{c.name}</h3>
                {c.description && <p className="mt-1 text-sm text-gray-600">{c.description}</p>}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
