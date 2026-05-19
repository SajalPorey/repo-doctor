"use client";

import { useState } from "react";

interface Step {
  number: number;
  title: string;
  description: string;
  command?: string;
  link?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium transition dark:text-zinc-400"
      style={{
        background: copied ? "rgba(16, 185, 129, 0.2)" : "var(--btn-bg, #f4f4f5)",
        color: copied ? "#059669" : "var(--btn-text, #52525b)",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex gap-3">
      {/* Step number */}
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-50/50 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
        {step.number}
      </div>

      <div className="flex-1 pb-4 border-b border-zinc-200 last:border-0 last:pb-0 dark:border-zinc-800/60">
        <p className="text-sm font-medium text-zinc-900 mb-0.5 dark:text-white">{step.title}</p>
        <p className="text-xs text-zinc-600 mb-2 dark:text-zinc-500">{step.description}</p>

        {step.command && (
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <code className="flex-1 text-xs text-violet-600 font-mono break-all dark:text-violet-300">
              {step.command}
            </code>
            <CopyButton text={step.command} />
          </div>
        )}

        {step.link && (
          <a
            href={step.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-500 transition mt-1 dark:text-violet-400 dark:hover:text-violet-300"
          >
            Open on GitHub ↗
          </a>
        )}
      </div>
    </div>
  );
}

interface ContributeGuideProps {
  owner: string;
  repoName: string;
  defaultBranch: string;
  hasContributing: boolean;
}

export default function ContributeGuide({
  owner,
  repoName,
  defaultBranch,
  hasContributing,
}: ContributeGuideProps) {
  const cloneUrl = `https://github.com/${owner}/${repoName}.git`;
  const forkUrl = `https://github.com/${owner}/${repoName}/fork`;
  const prUrl = `https://github.com/${owner}/${repoName}/compare`;
  const contributingUrl = `https://github.com/${owner}/${repoName}/blob/${defaultBranch}/CONTRIBUTING.md`;

  const steps: Step[] = [
    {
      number: 1,
      title: "Fork the repository",
      description: "Create your own copy of this repo under your GitHub account.",
      link: forkUrl,
    },
    {
      number: 2,
      title: "Clone your fork",
      description: "Download your forked copy to your local machine.",
      command: `git clone ${cloneUrl}`,
    },
    {
      number: 3,
      title: "Create a feature branch",
      description: `Never commit directly to ${defaultBranch}. Always work on a named branch.`,
      command: `git checkout -b feature/your-feature-name`,
    },
    {
      number: 4,
      title: "Make your changes & commit",
      description: "Stage your changes and write a clear commit message.",
      command: `git add .\ngit commit -m "feat: describe your change"`,
    },
    {
      number: 5,
      title: "Push your branch",
      description: "Upload your branch to your fork on GitHub.",
      command: `git push origin feature/your-feature-name`,
    },
    {
      number: 6,
      title: "Open a Pull Request",
      description: `Go to GitHub and open a PR from your branch to ${owner}/${repoName}:${defaultBranch}.`,
      link: prUrl,
    },
  ];

  return (
    <div className="space-y-4">
      {/* CONTRIBUTING.md banner */}
      {hasContributing && (
        <a
          href={contributingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-50/50 px-3 py-2.5 transition hover:border-violet-500/50 dark:bg-violet-500/10"
        >
          <span>📄</span>
          <div>
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-300">This repo has a CONTRIBUTING.md</p>
            <p className="text-xs text-zinc-500">Read it before submitting a PR ↗</p>
          </div>
        </a>
      )}

      {/* Repo info */}
      <div className="rounded-lg border border-zinc-200 bg-white/60 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-xs text-zinc-500 mb-1">Default branch</p>
        <p className="text-sm font-mono text-zinc-900 dark:text-white">
          <span className="text-zinc-500">{owner}/</span>{repoName}
          <span className="ml-2 rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {defaultBranch}
          </span>
        </p>
      </div>

      {/* Steps */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        {steps.map((step) => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>

      {/* Quick tips */}
      <div className="rounded-lg border border-zinc-200 bg-white/60 p-3 space-y-1.5 dark:border-zinc-800 dark:bg-zinc-950/60">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Quick Tips</p>
        {[
          "Keep PRs small and focused on one thing",
          "Write clear commit messages (use feat:, fix:, docs: prefixes)",
          `Sync with ${defaultBranch} before opening a PR: git pull upstream ${defaultBranch}`,
          "Check open issues before starting — someone may be working on it",
        ].map((tip, i) => (
          <p key={i} className="text-xs text-zinc-400 flex gap-2">
            <span className="text-zinc-600">•</span>
            {tip}
          </p>
        ))}
      </div>
    </div>
  );
}
