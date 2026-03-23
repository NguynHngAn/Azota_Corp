import { Button } from "@/components/ui/button";

export function FilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-background border border-border p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full h-auto ${
              active ? "shadow-sm" : "text-slate-600 hover:text-foreground hover:bg-card"
            }`}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

