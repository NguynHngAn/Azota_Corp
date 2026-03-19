import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-[var(--panel-bg)] text-[var(--text)] rounded-2xl border border-[var(--border-soft)] shadow-sm p-[var(--card-p)]",
        "transition-shadow hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

