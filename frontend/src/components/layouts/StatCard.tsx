import type { ReactNode } from "react";
import { Icons } from "@/components/layouts/Icons";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, trend, icon, className }: StatCardProps) {
  return (
    <div className="stat-card animate-in">
      <div className={`flex items-start justify-between mb-4 ${className}`}>
        <div className={`size-10 rounded-lg bg-primary/10 flex items-center justify-center ${className}`}>
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-success" : "text-destructive"
          }`}
        >
          {trend === "up" ? (
            <Icons.TrendingUp className="w-3 h-3" />
          ) : (
            <Icons.TrendingDown className="w-3 h-3" />
          )}
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}