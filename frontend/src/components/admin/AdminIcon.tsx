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
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "violet"
          ? "bg-violet-50 text-violet-700"
          : tone === "slate"
            ? "bg-slate-100 text-slate-700"
            : "bg-blue-50 text-blue-700";

  return (
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${toneClass}`}>
      {children}
    </div>
  );
}

