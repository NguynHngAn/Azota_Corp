import type React from "react";
import { Button } from "@/components/ui/button";

export type SettingsTab = "profile" | "notifications" | "security" | "appearance" | "language";

export function SettingsTabsNav({
  tab,
  onChange,
  items,
}: {
  tab: SettingsTab;
  onChange: (t: SettingsTab) => void;
  items: { id: SettingsTab; label: string; icon: () => React.ReactElement }[];
}) {
  return (
    <div className="">
      <div className="space-y-1">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <Button
              key={it.id}
              type="button"
              variant="ghost"
              onClick={() => onChange(it.id)}
              className={`w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-normal transition-colors ${
                active
                  ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  : "text-slate-600 hover:text-foreground hover:bg-background"
              }`}
            >
              <span className={`${active ? "text-primary" : "text-slate-500"}`}>
                <Icon />
              </span>
              <span className="font-medium">{it.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

