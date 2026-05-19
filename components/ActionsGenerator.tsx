"use client";

import { useState } from "react";
import { generateWorkflows } from "@/lib/actionsGenerator";
import type { TechStack } from "@/lib/detector";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded px-3 py-1 text-xs font-medium transition dark:text-zinc-400"
      style={{
        background: copied ? "rgba(16, 185, 129, 0.2)" : "var(--btn-bg, #f4f4f5)",
        color: copied ? "#059669" : "var(--btn-text, #52525b)",
      }}
    >
      {copied ? "✓ Copied!" : "Copy YAML"}
    </button>
  );
}

interface ActionsGeneratorProps {
  techStack: TechStack;
  defaultBranch: string;
  hasCi: boolean;
}

export default function ActionsGenerator({
  techStack,
  defaultBranch,
  hasCi,
}: ActionsGeneratorProps) {
  const workflows = generateWorkflows(techStack, defaultBranch);
  const [selected, setSelected] = useState(0);
  const workflow = workflows[selected];

  const stackLabel: Record<TechStack, string> = {
    typescript: "🟦 TypeScript",
    javascript: "🟨 JavaScript",
    python: "🐍 Python",
    rust: "🦀 Rust",
    go: "🐹 Go",
    java: "☕ Java",
    ruby: "💎 Ruby",
    other: "📁 Other",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-zinc-200 bg-white/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-sm font-semibold text-zinc-900 truncate dark:text-white">GitHub Actions Generator</p>
            <p className="text-xs text-zinc-600 mt-0.5 truncate dark:text-zinc-500">
              Ready-to-use CI workflow for {stackLabel[techStack]}
            </p>
          </div>
          {hasCi ? (
            <span className="flex-shrink-0 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-50/80 px-2.5 py-1 text-xs text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              ✓ CI exists
            </span>
          ) : (
            <span className="flex-shrink-0 whitespace-nowrap rounded-full border border-red-500/30 bg-red-50/80 px-2.5 py-1 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
              No CI yet
            </span>
          )}
        </div>
      </div>

      {/* Workflow selector (if multiple) */}
      {workflows.length > 1 && (
        <div className="flex gap-2">
          {workflows.map((w, i) => (
            <button
              key={w.filename}
              onClick={() => setSelected(i)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                selected === i
                  ? "border-violet-500/50 bg-violet-50/50 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
                  : "border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      {/* Workflow info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            📄 <code className="text-violet-600 dark:text-violet-300">.github/workflows/{workflow.filename}</code>
          </p>
          <CopyButton text={workflow.yaml} />
        </div>
        <p className="text-xs text-zinc-500">{workflow.description}</p>
      </div>

      {/* YAML block */}
      <div className="relative rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono">{workflow.filename}</span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-700 font-mono max-h-80 dark:text-zinc-300">
          {workflow.yaml.trimStart()}
        </pre>
      </div>

      {/* How to use */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 space-y-2 dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">How to add this</p>
        {[
          `Create the folder: .github/workflows/`,
          `Save the YAML as: .github/workflows/${workflow.filename}`,
          `git add .github/workflows/${workflow.filename}`,
          `git commit -m "ci: add ${stackLabel[techStack]} CI workflow"`,
          `git push — GitHub Actions will run automatically on next push`,
        ].map((step, i) => (
          <p key={i} className="text-xs text-zinc-400 flex gap-2">
            <span className="text-violet-400 font-bold flex-shrink-0">{i + 1}.</span>
            <code className="break-all">{step}</code>
          </p>
        ))}
      </div>
    </div>
  );
}
