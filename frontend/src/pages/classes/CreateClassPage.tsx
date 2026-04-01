import { useId, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { createClass } from "@/services/classes.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { t, useLanguage } from "@/i18n";

function basePath(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/teacher";
}

export function CreateClassPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const base = basePath(location.pathname);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const descriptionFieldId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (!token) return;
    try {
      const created = await createClass({ name, description: description || null }, token);
      navigate(`${base}/classes/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createClass.failed", lang));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-lg font-semibold text-foreground">{t("createClass.title", lang)}</h2>
      <Card className="max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("createClass.name", lang)}</label>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor={descriptionFieldId} className="block text-sm font-medium text-foreground mb-1">
              {t("createClass.description", lang)}
            </label>
            <Textarea
              id={descriptionFieldId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? t("createClass.creating", lang) : t("createClass.create", lang)}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`${base}/classes`)}>
              {t("common.cancel", lang)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
