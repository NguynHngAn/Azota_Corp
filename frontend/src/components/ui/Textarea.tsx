import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        "w-full px-4 py-3 border border-[var(--border)] rounded-xl text-sm bg-[var(--app-bg)]",
        "text-[var(--text)] placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)] focus:border-[var(--primary)]",
        "transition",
        className,
      )}
      {...props}
    />
  );
}

