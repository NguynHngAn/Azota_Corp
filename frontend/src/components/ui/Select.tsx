import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

