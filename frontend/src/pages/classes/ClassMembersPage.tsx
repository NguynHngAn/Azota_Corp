import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { getClass, listMembers, removeMember, type ClassDetail, type ClassMemberResponse } from "@/services/classes.service";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/Icons";
import { t, useLanguage } from "@/i18n";
import { classBasePath } from "@/pages/classes/classRoutes";

function tr(lang: ReturnType<typeof useLanguage>, key: string, values?: Record<string, string | number>) {
  const base = t(key as never, lang);
  if (!values) return base;
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{{${name}}}`, String(value)),
    base,
  );
}

export function ClassMembersPage() {
  const { token } = useAuth();
  const lang = useLanguage();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const base = classBasePath(location.pathname);
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [members, setMembers] = useState<ClassMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const classId = id ? parseInt(id, 10) : NaN;
  const subBase = `${base}/classes/${classId}`;

  useEffect(() => {
    if (!token || !id || isNaN(classId)) return;
    setLoading(true);
    setError("");
    getClass(classId, token)
      .then(setCls)
      .catch((e) => setError(e instanceof Error ? e.message : t("classDetail.loadFailed", lang)))
      .finally(() => setLoading(false));
  }, [token, id, classId, lang]);

  useEffect(() => {
    if (!token || isNaN(classId)) return;
    listMembers(classId, token).then(setMembers).catch(() => {});
  }, [token, classId]);

  async function handleRemoveConfirmed(member: ClassMemberResponse) {
    if (!token || !cls?.can_manage) return;
    try {
      await removeMember(classId, member.user_id, token);
      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
      setCls((c) => (c ? { ...c, member_count: Math.max(0, c.member_count - 1) } : c));
    } catch {
      // ignore
    }
  }

  if (loading) return <p className="text-muted-foreground">{t("common.loading", lang)}</p>;
  if (error || !cls) return <p className="text-destructive">{error || t("classDetail.notFound", lang)}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link to={`${base}/classes`} className="text-sm text-primary hover:underline flex items-center gap-2">
          <Icons.ArrowLeft className="size-4" /> {t("classDetail.backToClasses", lang)}
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link to={subBase} className="text-sm text-primary hover:underline">
          {cls.name}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={subBase}>{t("classNav.classOverview", lang)}</Link>
        </Button>
        {cls.can_manage ? (
          <Button type="button" variant="default" size="sm" asChild>
            <Link to={`${subBase}/settings`}>{t("classNav.settings", lang)}</Link>
          </Button>
        ) : null}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("classDetail.members", lang)}</h3>
          <Badge variant="secondary">{tr(lang, "classDetail.totalMembers", { count: members.length })}</Badge>
        </div>
        {!cls.can_manage ? (
          <p className="text-sm text-muted-foreground mb-3">{t("classMembers.readOnlyHint", lang)}</p>
        ) : null}
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("classDetail.noMembers", lang)}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name", lang)}</TableHead>
                <TableHead>{t("common.email", lang)}</TableHead>
                <TableHead className="text-right">{t("common.actions", lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.user?.full_name ?? "—"}</TableCell>
                  <TableCell>{m.user?.email ?? ""}</TableCell>
                  <TableCell className="text-right">
                    {cls.can_manage ? (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          const label = m.user?.full_name ?? t("classDetail.thisUser", lang);
                          if (window.confirm(tr(lang, "classDetail.removeMemberConfirm", { name: label }))) {
                            void handleRemoveConfirmed(m);
                          }
                        }}
                        className="h-auto p-0 text-xs text-destructive"
                      >
                        {t("common.remove", lang)}
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
