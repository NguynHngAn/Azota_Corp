import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full h-[var(--control-h)] px-4 border border-[var(--border)] rounded-xl text-sm bg-[var(--app-bg)]",
        "text-[var(--text)] placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)] focus:border-[var(--primary)]",
        "transition",
        className,
      )}
      {...props}
    />
  );
}

