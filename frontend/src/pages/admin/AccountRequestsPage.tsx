import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Search, ChevronLeft, ChevronRight, InboxIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/api/client";
import {
  getAdminAccountRequests,
  updateAccountRequestStatus,
  type AccountRequestRow,
  type AccountRequestRowStatus,
} from "@/api/adminAccountRequests";
import { useToast } from "@/hooks/use-toast";
import { t, useLanguage } from "@/i18n";

const PAGE_SIZE = 10;

const statusConfig: Record<AccountRequestRowStatus, { className: string }> = {
  pending: {
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
  },
  approved: {
    className:
      "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  },
  rejected: {
    className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
  },
};

function StatusBadge({ status, lang }: { status: AccountRequestRowStatus; lang: "en" | "vi" }) {
  const config = statusConfig[status];
  const label =
    status === "pending"
      ? t("common.status.pending", lang)
      : status === "approved"
        ? t("common.status.approved", lang)
        : t("common.status.rejected", lang);
  return (
    <Badge variant="outline" className={config.className}>
      {label}
    </Badge>
  );
}

function formatDate(iso: string, lang: "en" | "vi") {
  return new Date(iso).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AccountRequestsPage() {
  const lang = useLanguage();
  const { token } = useAuth();
  const { success } = useToast();

  const [items, setItems] = useState<AccountRequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountRequestRowStatus>("all");
  const [page, setPage] = useState(1);

  const [confirmAction, setConfirmAction] = useState<{ id: number; action: "approve" | "reject" } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const loadList = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setListError(t("adminAccountRequests.notAuthenticated", lang));
      return;
    }
    setIsLoading(true);
    setListError("");
    try {
      const res = await getAdminAccountRequests(token, {
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        page,
        page_size: PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      if (e instanceof ApiError) {
        setListError(e.message);
      } else {
        setListError(t("adminAccountRequests.networkError", lang));
      }
      setItems([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter, debouncedSearch, page]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function handleConfirm() {
    if (!confirmAction || !token) return;
    setConfirmLoading(true);
    setListError("");
    try {
      await updateAccountRequestStatus(
        token,
        confirmAction.id,
        confirmAction.action === "approve" ? "approved" : "rejected",
      );
      success(
        confirmAction.action === "approve"
          ? t("adminAccountRequests.approvedToast", lang)
          : t("adminAccountRequests.rejectedToast", lang),
      );
      setConfirmAction(null);
      await loadList();
    } catch (e) {
      if (e instanceof ApiError) {
        setListError(e.message);
      } else {
        setListError(t("adminAccountRequests.networkError", lang));
      }
      setConfirmAction(null);
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("adminAccountRequests.title", lang)}</h1>
        <p className="text-muted-foreground">{t("adminAccountRequests.subtitle", lang)}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">{t("adminAccountRequests.requests", lang)}</CardTitle>
              <CardDescription>{t("adminAccountRequests.total", { count: total }, lang)}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("adminAccountRequests.searchPlaceholder", lang)}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                className="pl-9"
                aria-label={t("adminAccountRequests.searchAria", lang)}
              />
            </div>
          </div>
        </CardHeader>

        <div className="px-6">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as typeof statusFilter);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">{t("common.all", lang)}</TabsTrigger>
              <TabsTrigger value="pending">{t("common.status.pending", lang)}</TabsTrigger>
              <TabsTrigger value="approved">{t("common.status.approved", lang)}</TabsTrigger>
              <TabsTrigger value="rejected">{t("common.status.rejected", lang)}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <CardContent className="pt-4">
          {listError ? (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {listError}
            </p>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <InboxIcon className="mb-3 h-10 w-10" />
              <p className="text-sm font-medium">{t("adminAccountRequests.empty", lang)}</p>
            </div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminAccountRequests.fullName", lang)}</TableHead>
                    <TableHead>{t("common.email", lang)}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("adminAccountRequests.organization", lang)}</TableHead>
                    <TableHead>{t("common.role", lang)}</TableHead>
                    <TableHead>{t("common.status", lang)}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t("adminAccountRequests.created", lang)}</TableHead>
                    <TableHead className="text-right">{t("common.actions", lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.full_name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{r.organization || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {r.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} lang={lang} />
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {formatDate(r.created_at, lang)}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              disabled={confirmLoading || confirmAction?.id === r.id}
                              onClick={() => setConfirmAction({ id: r.id, action: "approve" })}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" /> {t("adminAccountRequests.approve", lang)}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={confirmLoading || confirmAction?.id === r.id}
                              onClick={() => setConfirmAction({ id: r.id, action: "reject" })}
                            >
                              <X className="mr-1 h-3.5 w-3.5" /> {t("adminAccountRequests.reject", lang)}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {t("adminAccountRequests.pageOf", { page, totalPages }, lang)}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> {t("common.pagination.previous", lang)}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("common.pagination.next", lang)} <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "approve"
                ? t("adminAccountRequests.approveConfirmTitle", lang)
                : t("adminAccountRequests.rejectConfirmTitle", lang)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === "approve"
                ? t("adminAccountRequests.approveConfirmDescription", lang)
                : t("adminAccountRequests.rejectConfirmDescription", lang)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>{t("common.cancel", lang)}</AlertDialogCancel>
            <Button type="button" disabled={confirmLoading} onClick={() => void handleConfirm()}>
              {confirmLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              {confirmAction?.action === "approve"
                ? t("adminAccountRequests.approve", lang)
                : t("adminAccountRequests.reject", lang)}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
