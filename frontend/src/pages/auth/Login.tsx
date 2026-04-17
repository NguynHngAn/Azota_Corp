import { useId, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";

function LoginHeader({ lang }: { lang: ReturnType<typeof useLanguage> }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary" aria-hidden="true">
        <Icons.GraduationCap className="h-7 w-7 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">{t("login.welcomeBack", lang)}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle", lang)}</p>
    </div>
  );
}

export function Login() {
  const lang = useLanguage();
  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showPasswordResetNotice = searchParams.get("password-reset") === "success";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password, { rememberMe });
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "teacher") navigate("/teacher", { replace: true });
      else navigate("/student", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.failed", lang));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="w-full max-w-md space-y-8 animate-in">
        <LoginHeader lang={lang} />

        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6" noValidate>
          {showPasswordResetNotice ? (
            <p
              role="status"
              className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-100"
            >
              {t("login.passwordResetSuccess", lang)}
            </p>
          ) : null}
          <div>
            <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-foreground">
              {t("common.email", lang)}
            </label>
            <div className="relative">
              <Icons.Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="rounded-lg py-2.5 pl-10 pr-3 text-sm transition-all focus-visible:border-primary focus-visible:ring-primary/20"
                placeholder={t("login.emailPlaceholder", lang)}
              />
            </div>
          </div>

          <div>
            <label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-foreground">
              {t("login.password", lang)}
            </label>
            <div className="relative">
              <Icons.Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="rounded-lg py-2.5 pl-10 pr-10 text-sm transition-all focus-visible:border-primary focus-visible:ring-primary/20"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? t("login.hidePassword", lang) : t("login.showPassword", lang)}
                aria-controls={passwordId}
                aria-pressed={showPassword}
              >
                {showPassword ? <Icons.Eye className="h-4 w-4" aria-hidden /> : <Icons.EyeOff className="h-4 w-4" aria-hidden />}
              </Button>
            </div>
          </div>

          <div className="flex justify-end text-sm">
            <Link to="/forgot-password" className="font-medium text-primary hover:underline">
              {t("login.forgotPassword", lang)}
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <input
                id={rememberId}
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 shrink-0 rounded border-input accent-primary"
              />
              <label htmlFor={rememberId} className="cursor-pointer text-muted-foreground leading-snug">
                {t("login.rememberMe", lang)}
              </label>
            </div>
            <Link to="/" className="shrink-0 font-medium text-primary hover:underline">
              {t("login.backToHome", lang)}
            </Link>
          </div>

          {error ? (
            <p role="alert" aria-live="assertive" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting} className="w-full rounded-lg">
            {submitting ? t("login.signingIn", lang) : t("login.signIn", lang)}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("login.needAccount", lang)}{" "}
          <Link to="/request-account" className="font-medium text-primary hover:underline">
            {t("login.contactAdmin", lang)}
          </Link>
        </p>
      </main>
    </div>
  );
}
