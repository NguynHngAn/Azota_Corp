import clsx from "clsx";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function OptionCard({
  title,
  description,
  icon,
  selected,
  onSelect,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      className={clsx(
        "h-auto w-full flex-col items-stretch rounded-2xl border p-4 text-left font-normal transition",
        "hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        selected
          ? "border-primary bg-primary/10 shadow-sm ring-2 ring-ring hover:bg-primary/10"
          : "border-border bg-card shadow-sm hover:bg-background",
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center text-slate-700">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {description ? <div className="mt-1 text-xs text-muted-foreground">{description}</div> : null}
        </div>
      </div>
    </Button>
  );
}

