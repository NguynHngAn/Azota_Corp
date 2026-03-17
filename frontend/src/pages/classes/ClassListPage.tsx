import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listClasses, type ClassResponse } from "../../api/classes";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

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
    <div className="space-y-4">
      <PageHeader
        title="Classes"
        description={base === "/admin" ? "Manage all classes in the system." : "Classes that you own or teach."}
        actions={
          <Button>
            <Link to={`${base}/classes/new`} className="text-white">
              Create class
            </Link>
          </Button>
        }
      />

      {classes.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No classes yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id} className="hover:ring-1 hover:ring-blue-100 transition">
              <Link to={`${base}/classes/${c.id}`} className="block">
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
