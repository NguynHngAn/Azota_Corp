import type { ReactNode } from "react";

export function AdminIcon({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "amber" | "violet" | "slate";
}) {
  const toneClass =
    tone === "green"
      ? "bg-success/10 size-10 rounded-lg flex items-center justify-center text-success"
      : tone === "amber"
        ? "bg-warning/10 size-10 rounded-lg flex items-center justify-center text-warning"
        : tone === "violet"
          ? "bg-violet-50 size-10 rounded-lg flex items-center justify-center text-violet-700"
          : tone === "slate"
            ? "bg-info/10 size-10 rounded-lg flex items-center justify-center text-info"
            : "bg-primary/10 size-10 rounded-lg flex items-center justify-center text-primary";

  return (
    <div className={`size-5 ${toneClass}`}>
      {children}
    </div>
  );
}

