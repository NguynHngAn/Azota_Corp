import type { ScoreBucket } from "@/services/assignments.service";

interface ScoreBarChartProps {
  buckets: ScoreBucket[];
}

export function ScoreBarChart({ buckets }: ScoreBarChartProps) {
  const maxCount = buckets.reduce((max, b) => (b.count > max ? b.count : max), 0);
  if (!buckets.length || maxCount === 0) {
    return <p className="text-sm text-gray-500">No score data yet.</p>;
  }

  return (
    <div className="flex items-end gap-4 h-40">
      {buckets.map((b) => {
        const height = (b.count / maxCount) * 100;
        return (
          <div key={b.label} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{ height: `${height}%`, minHeight: b.count > 0 ? "4px" : "0" }}
            />
            <span className="mt-1 text-xs text-gray-700 font-medium">{b.count}</span>
            <span className="mt-0.5 text-xs text-gray-500">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

