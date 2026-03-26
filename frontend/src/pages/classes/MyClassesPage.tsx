import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { listMyClasses, type ClassResponse } from "@/services/classes.service";
import { Card } from "@/components/ui/card";
import { JoinClassPanel } from "@/components/features/student/join-class-panel";

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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-sm text-muted-foreground">View your enrolled classes or join a new one.</p>
      </div>

      <JoinClassPanel />

      {classes.length === 0 ? (
        <Card className="border border-slate-100 shadow-sm hover:shadow-sm">
          <div className="py-14 text-center">
            <div className="text-sm font-medium text-foreground">You haven’t joined any classes yet.</div>
            <div className="text-sm text-muted-foreground mt-1">
              Use an invite code above to join one.
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <Link to={`/student/classes/${c.id}`} className="block">
                <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                {c.description ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No description</p>
                )}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
