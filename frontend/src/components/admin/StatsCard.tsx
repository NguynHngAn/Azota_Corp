import type { ReactNode } from "react";
import { Card } from "../ui/Card";
import { AdminIcon } from "./AdminIcon";

export function StatsCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone?: "blue" | "green" | "amber" | "violet" | "slate";
}) {
  return (
    <Card className="group border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <AdminIcon tone={tone}>{icon}</AdminIcon>
        <div className="h-4 w-10 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors" />
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold text-slate-900 leading-none">{value}</div>
        <div className="mt-2 text-xs text-slate-500">{label}</div>
      </div>
    </Card>
  );
}

