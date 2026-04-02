import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { joinClass } from "@/services/classes.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { t, useLanguage } from "@/i18n";

export function JoinClassPage() {
  const { token } = useAuth();
  const lang = useLanguage();
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
      setError(err instanceof Error ? err.message : t("joinClassPage.failed", lang));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("joinClassPage.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("joinClassPage.subtitle", lang)}
          </p>
        </div>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("joinClassPage.inviteCode", lang)}</label>
            <Input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t("joinClassPage.placeholder", lang)}
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? t("joinClass.joining", lang) : t("joinClassPage.join", lang)}
          </Button>
        </form>
      </Card>
    </div>
  );
}
