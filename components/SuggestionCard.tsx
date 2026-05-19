import type { CategoryName, RepoCheck } from "@/types/scan";

interface SuggestionCardProps {
  check: RepoCheck & {
    categoryName: CategoryName;
  };
}

export default function SuggestionCard({ check }: SuggestionCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white/80 p-5 transition hover:border-violet-500/40 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500 dark:text-violet-300">
            {check.categoryName}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">{check.label}</h3>
        </div>
        <span className="rounded-full border border-red-500/20 bg-red-50/50 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          -{check.points} pts
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Why it matters
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{check.suggestion.why}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            How to fix
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{check.suggestion.fix}</p>
        </div>
      </div>

      {check.suggestion.example ? (
        <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {check.suggestion.example}
        </pre>
      ) : null}
    </article>
  );
}
