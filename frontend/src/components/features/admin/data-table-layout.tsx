import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableLayoutProps {
  title: string;
  controls?: ReactNode;
  loading: boolean;
  error?: string;
  isEmpty: boolean;
  emptyMessage: string;
  loadingRows?: number;
  onRetry?: () => void;
  retryLabel?: string;
  children: ReactNode;
}

export function DataTableLayout({
  title,
  controls,
  loading,
  error,
  isEmpty,
  emptyMessage,
  loadingRows = 3,
  onRetry,
  retryLabel,
  children,
}: DataTableLayoutProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader
        className={cn(
          "flex flex-col gap-3 space-y-0 p-4 sm:p-6",
          controls && "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <CardTitle className="text-base font-semibold leading-none">{title}</CardTitle>
        {controls ? <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{controls}</div> : null}
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: loadingRows }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
            {onRetry && retryLabel ? (
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null}
          </div>
        ) : isEmpty ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
