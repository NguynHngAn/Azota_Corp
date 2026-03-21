import * as React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full h-[var(--control-h)] px-4 border border-[var(--border)] rounded-xl text-sm bg-[var(--app-bg)]",
        "text-[var(--text)] placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)] focus:border-[var(--primary)]",
        "transition",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

