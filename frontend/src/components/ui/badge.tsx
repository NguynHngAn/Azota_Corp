import type { ReactNode } from "react";
import clsx from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "danger";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

