import clsx from "clsx";

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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked ? "bg-[var(--primary)]" : "bg-slate-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]",
      )}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

