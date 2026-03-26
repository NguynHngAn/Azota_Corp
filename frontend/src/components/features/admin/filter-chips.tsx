import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={active ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-auto rounded-full px-3 py-1.5 text-xs",
              active ? "shadow-sm" : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

