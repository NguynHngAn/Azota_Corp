import React, { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { ApiError } from "@/api/client";
import { submitAccountRequest } from "@/api/accountRequests";
import { useToast } from "@/hooks/use-toast";
import { t, useLanguage } from "@/i18n";

interface FormData {
  fullName: string;
  email: string;
  organization: string;
  role: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  role?: string;
}

function parseApiError(err: ApiError): { fieldErrors: Partial<FormErrors>; formError: string | null } {
  const detail = err.detail;
  if (err.status === 422 && Array.isArray(detail)) {
    const fieldErrors: Partial<FormErrors> = {};
    const extra: string[] = [];
    for (const item of detail) {
      if (typeof item !== "object" || item === null) continue;
      const msg = typeof (item as { msg?: unknown }).msg === "string" ? (item as { msg: string }).msg : err.message;
      const loc = (item as { loc?: unknown }).loc;
      if (!Array.isArray(loc)) continue;
      const parts = loc.filter((x): x is string => typeof x === "string");
      const tail = parts[parts.length - 1];
      if (tail === "email") fieldErrors.email = msg;
      else if (tail === "full_name") fieldErrors.fullName = msg;
      else if (tail === "role") fieldErrors.role = msg;
      else extra.push(msg);
    }
    const hasField = Object.keys(fieldErrors).length > 0;
    const formError = extra.length > 0 ? extra.join(" ") : hasField ? null : err.message;
    return { fieldErrors, formError };
  }
  if (err.status === 400) {
    const msg = typeof detail === "string" ? detail : err.message;
    return { fieldErrors: {}, formError: msg };
  }
  return { fieldErrors: {}, formError: err.message || "" };
}

const RequestAccountPage: React.FC = () => {
  const lang = useLanguage();
  const { success } = useToast();
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    organization: "",
    role: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = t("requestAccount.fullNameRequired", lang);
    if (!form.email.trim()) {
      newErrors.email = t("requestAccount.emailRequired", lang);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = t("requestAccount.invalidEmail", lang);
    }
    if (!form.role) newErrors.role = t("requestAccount.roleRequired", lang);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const organization = form.organization.trim();
    const message = form.message.trim();

    setIsSubmitting(true);
    try {
      await submitAccountRequest({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        ...(organization ? { organization } : {}),
        role: form.role as "student" | "teacher",
        ...(message ? { message } : {}),
      });
      setIsSuccess(true);
      success(t("requestAccount.successToast", lang));
    } catch (err) {
      if (err instanceof ApiError) {
        const { fieldErrors, formError: nextForm } = parseApiError(err);
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setFormError(nextForm);
      } else {
        setFormError(t("requestAccount.fallbackError", lang));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError(null);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="space-y-4 pb-8 pt-10">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">{t("requestAccount.successTitle", lang)}</h2>
            <p className="text-sm text-muted-foreground">
              {t("requestAccount.successBody", lang)}
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("requestAccount.backToLogin", lang)}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("requestAccount.title", lang)}</CardTitle>
          <CardDescription>
            {t("requestAccount.description", lang)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t("requestAccount.fullName", lang)} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder={t("requestAccount.fullNamePlaceholder", lang)}
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
              />
              {errors.fullName ? (
                <p id="fullName-error" className="text-sm text-destructive">
                  {errors.fullName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t("requestAccount.email", lang)} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("requestAccount.emailPlaceholder", lang)}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email ? (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">{t("requestAccount.organization", lang)}</Label>
              <Input
                id="organization"
                placeholder={t("requestAccount.organizationPlaceholder", lang)}
                value={form.organization}
                onChange={(e) => updateField("organization", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                {t("requestAccount.role", lang)} <span className="text-destructive">*</span>
              </Label>
              <Select value={form.role} onValueChange={(v) => updateField("role", v)}>
                <SelectTrigger id="role" aria-invalid={!!errors.role} aria-describedby={errors.role ? "role-error" : undefined}>
                  <SelectValue placeholder={t("requestAccount.rolePlaceholder", lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">{t("requestAccount.role.student", lang)}</SelectItem>
                  <SelectItem value="teacher">{t("requestAccount.role.teacher", lang)}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role ? (
                <p id="role-error" className="text-sm text-destructive">
                  {errors.role}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{t("requestAccount.message", lang)}</Label>
              <Textarea
                id="message"
                placeholder={t("requestAccount.messagePlaceholder", lang)}
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={3}
              />
            </div>

            {formError ? (
              <p id="form-error" role="alert" aria-live="polite" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? t("requestAccount.submitting", lang) : t("requestAccount.submit", lang)}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("requestAccount.haveAccount", lang)}{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                {t("requestAccount.signIn", lang)}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestAccountPage;
