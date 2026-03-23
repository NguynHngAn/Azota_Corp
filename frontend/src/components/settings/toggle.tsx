import clsx from "clsx";
import { Button } from "@/components/ui/button";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 min-h-0 min-w-[2.75rem] items-center rounded-full p-0 transition hover:bg-transparent",
        checked ? "bg-primary hover:bg-primary" : "bg-slate-200 hover:bg-slate-200",
        "focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </Button>
  );
}

