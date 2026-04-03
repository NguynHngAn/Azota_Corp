import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { joinClass } from "@/services/classes.service";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";

export function JoinClassPanel({
  title,
  description,
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
  const lang = useLanguage();
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
      setNotice({ kind: "error", message: t("joinClass.emptyCode", lang) });
      return;
    }
    if (!token) return;
    setSubmitting(true);
    setNotice(null);
    try {
      await joinClass(code, token);
      setNotice({ kind: "success", message: t("joinClass.success", lang) });
      navigate(redirectTo);
    } catch (err) {
      setNotice({ kind: "error", message: err instanceof Error ? err.message : t("joinClass.failed", lang) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground mb-3">{title ?? t("joinClass.title", lang)}</div>
          {!compact && <div className="flex items-center gap-3">{t("joinClass.helper", lang)}</div>}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            className="flex-1 max-w-xs px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder={description ?? t("joinClass.description", lang)}
          />
        </div>
        <Button
          size="sm"
          onClick={handleJoin}
          disabled={submitting}
          className="gap-1.5 rounded-lg"
          
        >
          <Icons.Plus />
          {submitting ? t("joinClass.joining", lang) : t("joinClass.join", lang)}
        </Button>
      </div>

      {notice && (
        <div
          className={`mt-3 text-sm rounded-xl px-3 py-2.5 border max-w-xs ${
            notice.kind === "error"
              ? "text-destructive bg-destructive/10 border-destructive/20"
              : "text-success bg-success/10 border-success/20"
          }`}
        >
          {notice.message}
        </div>
      )}
    </div>
  );
}

