import { useId, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/layouts/Icons";
import { requestPasswordReset } from "@/api/auth";
import { t, useLanguage } from "@/i18n";

export function ForgotPasswordPage() {
  const lang = useLanguage();
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [done, setDone] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e = email.trim();
    if (!e) {
      setEmailError(t("forgotPassword.emailRequired", lang));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setEmailError(t("forgotPassword.invalidEmail", lang));
      return false;
    }
    setEmailError("");
    return true;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setNetworkError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setSuccessMessage(res.message);
      setDone(true);
    } catch {
      setNetworkError(t("forgotPassword.networkError", lang));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <main className="glass-card w-full max-w-md space-y-4 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10" aria-hidden>
            <Icons.Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{t("forgotPassword.successTitle", lang)}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{successMessage}</p>
          <Button variant="outline" className="mt-2 w-full" asChild>
            <Link to="/login">{t("forgotPassword.backToLogin", lang)}</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="glass-card w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t("forgotPassword.title", lang)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("forgotPassword.description", lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-foreground">
              {t("forgotPassword.emailLabel", lang)}
            </label>
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder={t("login.emailPlaceholder", lang)}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "fp-email-err" : undefined}
            />
            {emailError ? (
              <p id="fp-email-err" className="mt-1 text-sm text-destructive">
                {emailError}
              </p>
            ) : null}
          </div>

          {networkError ? (
            <p role="alert" className="text-sm text-destructive">
              {networkError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t("forgotPassword.submitting", lang) : t("forgotPassword.submit", lang)}
          </Button>

          <p className="text-center text-sm">
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t("forgotPassword.backToLogin", lang)}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
