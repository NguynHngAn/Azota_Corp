import type { ReactNode } from "react";
import { Icons } from "@/components/layouts/Icons";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: ReactNode;
}

export function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="stat-card animate-in">
      <div className="flex items-start justify-between mb-4">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-success" : "text-destructive"
          }`}
        >
          {trend === "up" ? (
            <Icons.TrendingUp className="size-3" />
          ) : (
            <Icons.TrendingDown className="size-3" />
          )}
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}