import clsx from "clsx";
import type { ReactNode } from "react";

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
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "text-left w-full rounded-2xl border p-4 transition",
        "hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        selected
          ? "border-[var(--primary-ring)] bg-[var(--primary-soft)] shadow-sm ring-2 ring-[var(--primary-ring)]"
          : "border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-sm hover:bg-[var(--app-bg)]",
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="h-9 w-9 rounded-xl bg-[var(--app-bg)] border border-[var(--border-soft)] flex items-center justify-center text-slate-700">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
          {description ? <div className="mt-1 text-xs text-[var(--muted)]">{description}</div> : null}
        </div>
      </div>
    </button>
  );
}

