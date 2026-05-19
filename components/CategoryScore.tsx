import type { CategoryResult } from "@/types/scan";

interface CategoryScoreProps {
  category: CategoryResult;
}

export default function CategoryScore({ category }: CategoryScoreProps) {
  const percentage = Math.round((category.score / category.maxScore) * 100);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white/70 p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{category.name}</p>
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {category.score}/{category.maxScore}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${getBarClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getBarClass(percentage: number): string {
  if (percentage > 75) {
    return "bg-emerald-500";
  }

  if (percentage >= 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}
