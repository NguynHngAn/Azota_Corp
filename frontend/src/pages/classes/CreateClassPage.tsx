import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { createClass } from "@/services/classes.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function CreateClassPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (!token) return;
    try {
      const created = await createClass({ name, description: description || null }, token);
      navigate(`${base}/classes/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Create class</h2>
      <Card className="max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`${base}/classes`)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
