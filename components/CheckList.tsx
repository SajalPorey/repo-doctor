import type { CategoryName, RepoCheck } from "@/types/scan";

export type DisplayCheck = RepoCheck & {
  categoryName: CategoryName;
};

interface CheckListProps {
  title: string;
  checks: DisplayCheck[];
  tone: "passed" | "failed";
}

export default function CheckList({ title, checks, tone }: CheckListProps) {
  const toneClasses =
    tone === "passed"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-red-500/20 bg-red-500/10 text-red-300";

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${toneClasses}`}>
          {checks.length}
        </span>
      </div>

      {checks.length === 0 ? (
        <p className="text-sm text-zinc-500">No checks in this group.</p>
      ) : (
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={`${check.categoryName}-${check.id}`}
              className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{check.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{check.categoryName}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-zinc-400">
                  {check.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
