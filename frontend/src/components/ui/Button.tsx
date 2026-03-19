import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  selected?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center select-none font-medium outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow focus:ring-2 focus:ring-[var(--primary-ring)]",
  secondary:
    "bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-sm hover:shadow focus:ring-2 focus:ring-[var(--primary-ring)]",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-[var(--primary-ring)]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow focus:ring-2 focus:ring-rose-200",
};

const sizes: Record<Size, string> = {
  sm: "h-[var(--control-h-sm)] px-3 text-xs rounded-lg",
  md: "h-[var(--control-h)] px-4 text-sm rounded-xl",
  lg: "h-[var(--control-h-lg)] px-5 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  selected = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        "active:scale-[0.98] hover:-translate-y-[1px] active:translate-y-0",
        selected ? "ring-2 ring-[var(--primary-ring)] bg-[var(--primary-soft)] text-[var(--primary)]" : "",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

