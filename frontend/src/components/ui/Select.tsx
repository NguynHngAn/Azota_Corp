import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full h-[var(--control-h)] px-4 border border-[var(--border)] rounded-xl text-sm bg-[var(--app-bg)]",
        "text-[var(--text)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)] focus:border-[var(--primary)]",
        "transition",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

