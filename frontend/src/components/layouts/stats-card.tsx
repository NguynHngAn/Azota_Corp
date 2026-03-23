import type { ReactNode } from "react";
import { AdminIcon } from "@/components/features/admin/admin-icon";

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
      <div className="stat-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <AdminIcon tone={tone}>{icon}</AdminIcon>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </div>
  );
}

