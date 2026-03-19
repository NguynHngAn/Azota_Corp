import type React from "react";

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
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-bg)] p-2 shadow-sm">
      <div className="space-y-1">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-slate-600 hover:text-[var(--text)] hover:bg-[var(--app-bg)]"
              }`}
            >
              <span className={`${active ? "text-[var(--primary)]" : "text-slate-500"}`}>
                <Icon />
              </span>
              <span className="font-medium">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

