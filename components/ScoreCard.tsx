interface ScoreCardProps {
  score: number;
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-6 shadow-violet-glow">
      <div className="flex flex-col items-center justify-center">
        <div
          className="flex h-44 w-44 items-center justify-center rounded-full p-3"
          style={{
            background: `conic-gradient(${color} ${clampedScore * 3.6}deg, #27272a 0deg)`
          }}
          aria-label={`Repository health score ${clampedScore} out of 100`}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
            <span className="text-5xl font-bold tracking-normal text-white">{clampedScore}</span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Health
            </span>
          </div>
        </div>
        <p className="mt-5 text-center text-sm text-zinc-400">
          {getScoreLabel(clampedScore)}
        </p>
      </div>
    </section>
  );
}

function getScoreColor(score: number): string {
  if (score > 75) {
    return "#10b981";
  }

  if (score >= 50) {
    return "#f59e0b";
  }

  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score > 75) {
    return "Strong foundation with a few polish opportunities.";
  }

  if (score >= 50) {
    return "Usable repo, but important upgrade work remains.";
  }

  return "High-risk repo health. Start with the failed checks.";
}
