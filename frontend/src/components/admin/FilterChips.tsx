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
    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--app-bg)] border border-[var(--border-soft)] p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              active
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-slate-600 hover:text-[var(--text)] hover:bg-[var(--panel-bg)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

