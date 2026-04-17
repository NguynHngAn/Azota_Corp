import { useId, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/layouts/Icons";
import { ApiError } from "@/api/client";
import { resetPassword } from "@/api/auth";
import { t, useLanguage } from "@/i18n";
import { useToast } from "@/hooks/use-toast";

export function ResetPasswordPage() {
  const lang = useLanguage();
  const navigate = useNavigate();
  const { success } = useToast();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const pwId = useId();
  const confirmId = useId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    let ok = true;
    if (password.length < 6) {
      setPwError(t("resetPassword.passwordTooShort", lang));
      ok = false;
    } else {
      setPwError("");
    }
    if (password !== confirm) {
      setConfirmError(t("resetPassword.mismatch", lang));
      ok = false;
    } else {
      setConfirmError("");
    }
    return ok;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setApiError("");
    if (!token) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      success(t("resetPassword.successToast", lang));
      navigate("/login?password-reset=success", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(e.message);
      } else {
        setApiError(t("forgotPassword.networkError", lang));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <main className="glass-card w-full max-w-md space-y-4 p-6 text-center">
          <p role="alert" className="text-sm text-destructive">
            {t("resetPassword.invalidToken", lang)}
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/forgot-password">{t("resetPassword.backToForgot", lang)}</Link>
          </Button>
          <Link to="/login" className="block text-sm text-primary hover:underline">
            {t("forgotPassword.backToLogin", lang)}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="glass-card w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10" aria-hidden>
            <Icons.Key className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("resetPassword.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("resetPassword.description", lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor={pwId} className="mb-1.5 block text-sm font-medium text-foreground">
              {t("resetPassword.newPassword", lang)}
            </label>
            <Input
              id={pwId}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (pwError) setPwError("");
              }}
              aria-invalid={!!pwError}
              aria-describedby={pwError ? "rp-pw-err" : undefined}
            />
            {pwError ? (
              <p id="rp-pw-err" className="mt-1 text-sm text-destructive">
                {pwError}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor={confirmId} className="mb-1.5 block text-sm font-medium text-foreground">
              {t("resetPassword.confirmPassword", lang)}
            </label>
            <Input
              id={confirmId}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (confirmError) setConfirmError("");
              }}
              aria-invalid={!!confirmError}
              aria-describedby={confirmError ? "rp-cf-err" : undefined}
            />
            {confirmError ? (
              <p id="rp-cf-err" className="mt-1 text-sm text-destructive">
                {confirmError}
              </p>
            ) : null}
          </div>

          {apiError ? (
            <p role="alert" aria-live="assertive" className="text-sm text-destructive">
              {apiError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t("resetPassword.submitting", lang) : t("resetPassword.submit", lang)}
          </Button>

          <p className="text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              {t("resetPassword.backToForgot", lang)}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
