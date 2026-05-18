"use client";

import { useState } from "react";
import type { RiskItem, RiskSeverity } from "@/types/scan";

const SEVERITY_CONFIG: Record<
  RiskSeverity,
  { label: string; icon: string; border: string; bg: string; text: string; badge: string }
> = {
  high: {
    label: "High Risk",
    icon: "🔴",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  medium: {
    label: "Medium Risk",
    icon: "🟡",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  info: {
    label: "Info",
    icon: "🔵",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
};

function RiskCard({ risk }: { risk: RiskItem }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[risk.severity];

  return (
    <div
      className={`rounded-lg border ${config.border} ${config.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <span className="mt-0.5 text-sm">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{risk.title}</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${config.badge}`}
            >
              {config.label}
            </span>
          </div>
        </div>
        <span className="text-zinc-500 text-xs mt-0.5 flex-shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-2">
          <p className="text-sm text-zinc-400 leading-relaxed">{risk.description}</p>
          <div className="rounded-md bg-zinc-900 border border-zinc-800 p-3">
            <p className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Fix</p>
            <p className="text-xs text-zinc-300 leading-relaxed">{risk.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiskWarnings({ risks }: { risks: RiskItem[] }) {
  const [showAll, setShowAll] = useState(false);

  if (risks.length === 0) {
    return (
      <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-center gap-2">
        <span>✅</span>
        <span className="text-sm text-emerald-400 font-medium">No structural risks detected</span>
      </div>
    );
  }

  const highCount = risks.filter((r) => r.severity === "high").length;
  const mediumCount = risks.filter((r) => r.severity === "medium").length;

  // Show high risks first, then medium, then info
  const sorted = [...risks].sort((a, b) => {
    const order = { high: 0, medium: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const visible = showAll ? sorted : sorted.slice(0, 3);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Repo Risk Warnings</h2>
          <div className="flex gap-1">
            {highCount > 0 && (
              <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                {highCount} High
              </span>
            )}
            {mediumCount > 0 && (
              <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                {mediumCount} Medium
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-zinc-500">{risks.length} total</span>
      </div>

      {/* Risk cards */}
      <div className="space-y-2">
        {visible.map((risk) => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </div>

      {/* Show more / less */}
      {risks.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full rounded-md border border-zinc-800 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition"
        >
          {showAll ? "Show less ▲" : `Show ${risks.length - 3} more ▼`}
        </button>
      )}
    </div>
  );
}
