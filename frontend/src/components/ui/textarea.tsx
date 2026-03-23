import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        "w-full px-4 py-3 border border-input rounded-xl text-sm bg-background",
        "text-foreground placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
        "transition",
        className,
      )}
      {...props}
    />
  );
}

