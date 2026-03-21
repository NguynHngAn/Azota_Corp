import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { joinClass } from "../../api/classes";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function JoinClassPanel({
  title = "Join a Class",
  description = "Enter class invite code...",
  redirectTo = "/student/classes",
  compact = false,
}: {
  title?: string;
  description?: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";
  const [inviteCode, setInviteCode] = useState(codeFromUrl);
  const [notice, setNotice] = useState<null | { kind: "error" | "success"; message: string }>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setInviteCode((prev) => (codeFromUrl ? codeFromUrl : prev));
  }, [codeFromUrl]);

  async function handleJoin() {
    const code = inviteCode.trim();
    if (!code) {
      setNotice({ kind: "error", message: "Please enter an invite code." });
      return;
    }
    if (!token) return;
    setSubmitting(true);
    setNotice(null);
    try {
      await joinClass(code, token);
      setNotice({ kind: "success", message: "Joined class successfully." });
      navigate(redirectTo);
    } catch (err) {
      setNotice({ kind: "error", message: err instanceof Error ? err.message : "Failed to join class." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border border-slate-100 shadow-sm hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {!compact && <div className="text-xs text-slate-500 mt-1">Use an invite code from your teacher.</div>}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder={description}
          />
        </div>
        <Button
          size="sm"
          onClick={handleJoin}
          disabled={submitting}
          className="sm:w-auto w-full"
        >
          {submitting ? "Joining..." : "+ Join"}
        </Button>
      </div>

      {notice && (
        <div
          className={`mt-3 text-sm rounded-xl px-3 py-2 border ${
            notice.kind === "error"
              ? "text-rose-700 bg-rose-50 border-rose-100"
              : "text-emerald-800 bg-emerald-50 border-emerald-100"
          }`}
        >
          {notice.message}
        </div>
      )}
    </Card>
  );
}

