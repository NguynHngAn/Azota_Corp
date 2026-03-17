import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { joinClass } from "../../api/classes";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function JoinClassPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";
  const [inviteCode, setInviteCode] = useState(codeFromUrl);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setInviteCode((prev) => (codeFromUrl ? codeFromUrl : prev));
  }, [codeFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (!token) return;
    try {
      await joinClass(inviteCode, token);
      navigate("/student/classes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader
        title="Join a class"
        description="Enter the invite code from your teacher or use an invite link."
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invite code</label>
            <Input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. abc12XYZ"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Joining..." : "Join class"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
