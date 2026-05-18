"use client";

import { useScanHistory } from "@/hooks/useScanHistory";

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10";
  if (score >= 60) return "border-amber-500/30 bg-amber-500/10";
  return "border-red-500/30 bg-red-500/10";
}

interface ScanHistoryProps {
  onRescan: (owner: string, repo: string) => void;
}

export default function ScanHistory({ onRescan }: ScanHistoryProps) {
  const { history, clearHistory } = useScanHistory();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <span className="text-4xl">🕐</span>
        <p className="text-sm font-medium text-zinc-400">No scan history yet</p>
        <p className="text-xs text-zinc-600 max-w-48">
          Repos you scan will appear here so you can quickly re-check them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{history.length} repo{history.length !== 1 ? "s" : ""} scanned</p>
        <button
          onClick={clearHistory}
          className="text-xs text-zinc-600 hover:text-red-400 transition"
        >
          Clear all
        </button>
      </div>

      {/* History list */}
      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={`${entry.owner}/${entry.repoName}`}
            className="group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-3 transition hover:border-zinc-700"
          >
            {/* Score badge */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center ${scoreBg(entry.score)}`}
            >
              <span className={`text-base font-bold leading-none ${scoreColor(entry.score)}`}>
                {entry.score}
              </span>
              <span className="text-xs text-zinc-600 mt-0.5">/100</span>
            </div>

            {/* Repo info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate font-mono">
                <span className="text-zinc-500">{entry.owner}/</span>
                {entry.repoName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-500">{entry.language}</span>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-zinc-600">{timeAgo(entry.scannedAt)}</span>
                {entry.repoType !== "unknown" && (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-600">{entry.repoType}</span>
                  </>
                )}
              </div>
            </div>

            {/* Re-scan button */}
            <button
              onClick={() => onRescan(entry.owner, entry.repoName)}
              className="flex-shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition hover:border-violet-500/50 hover:text-violet-300"
            >
              Re-scan
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-zinc-700">
        Last {history.length} scans · stored locally
      </p>
    </div>
  );
}
