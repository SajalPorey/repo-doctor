"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import CategoryScore from "@/components/CategoryScore";
import CheckList, { type DisplayCheck } from "@/components/CheckList";
import ScoreCard from "@/components/ScoreCard";
import SuggestionCard from "@/components/SuggestionCard";
import RiskWarnings from "@/components/RiskWarnings";
import ContributeGuide from "@/components/ContributeGuide";
import ActionsGenerator from "@/components/ActionsGenerator";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ScanResponse } from "@/types/scan";
import type { RepoType, TechStack, MaturityLevel } from "@/lib/detector";

const REPO_TYPE_LABELS: Record<RepoType, string> = {
  library: "📦 Library",
  "web-app": "🌐 Web App",
  "cli-tool": "⌨️ CLI Tool",
  research: "🔬 Research",
  monorepo: "🏗 Monorepo",
  "docs-only": "📄 Docs",
  unknown: "📁 Unknown",
};

const STACK_LABELS: Record<TechStack, string> = {
  typescript: "🟦 TypeScript",
  javascript: "🟨 JavaScript",
  python: "🐍 Python",
  go: "🐹 Go",
  rust: "🦀 Rust",
  java: "☕ Java",
  ruby: "💎 Ruby",
  other: "📝 Other",
};

const MATURITY_LABELS: Record<MaturityLevel, string> = {
  production: "🚀 Production",
  growing: "📈 Growing",
  hobby: "🌱 Hobby",
};

function ContextBadge({
  label,
  color,
  title,
}: {
  label: string;
  color: "violet" | "blue" | "emerald" | "amber" | "zinc";
  title?: string;
}) {
  const colorMap = {
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    zinc: "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400",
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorMap[color]} cursor-default`}
    >
      {label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateStr));
}

export default function ReportDashboard({ data }: { data: ScanResponse }) {
  const checks = useMemo(
    () =>
      data.categories.flatMap((category) =>
        category.checks.map((check) => ({
          ...check,
          categoryName: category.name
        }))
      ),
    [data.categories]
  );
  const passedChecks = checks.filter((check) => check.passed);
  const failedChecks = checks.filter((check) => !check.passed);
  const [tab, setTab] = useState<"health" | "contribute" | "workflow">("health");

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:border-violet-500/50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        >
          Scan another repo
        </Link>
        <ThemeToggle />
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500 dark:text-violet-300">
              Repository
            </p>
            <h1 className="mt-2 break-words font-mono text-2xl font-semibold text-zinc-900 sm:text-3xl dark:text-white">
              {data.owner}/{data.repoName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {data.description || "No repository description provided."}
            </p>
            {/* Context badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <ContextBadge label={REPO_TYPE_LABELS[data.context.repoType]} color="violet" title={data.context.typeReason} />
              <ContextBadge label={STACK_LABELS[data.context.techStack]} color="blue" />
              <ContextBadge label={MATURITY_LABELS[data.context.maturity]} color={data.context.maturity === "production" ? "emerald" : data.context.maturity === "growing" ? "amber" : "zinc"} title={data.context.maturityReason} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:min-w-96 sm:grid-cols-5">
            <Metric label="Stars" value={data.stars.toLocaleString()} />
            <Metric label="Forks" value={data.forks.toLocaleString()} />
            <Metric label="Issues" value={data.openIssues.toLocaleString()} />
            <Metric label="Language" value={data.language} />
            <Metric label="Updated" value={formatDate(data.updatedAt)} />
          </div>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="mt-4 flex rounded-lg border border-zinc-200 bg-zinc-100/60 p-1 dark:border-zinc-800 dark:bg-zinc-900/60">
        <button
          onClick={() => setTab("health")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
            tab === "health"
              ? "bg-violet-500 text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          🩺 Health Report
        </button>
        <button
          onClick={() => setTab("contribute")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
            tab === "contribute"
              ? "bg-violet-500 text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          📘 Contribute
        </button>
        <button
          onClick={() => setTab("workflow")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
            tab === "workflow"
              ? "bg-violet-500 text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          🛠️ Actions
        </button>
      </div>

      {tab === "health" && (
        <>
          {/* Risk warnings above score */}
          <div className="mt-6">
            <RiskWarnings risks={data.risks} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <ScoreCard score={data.totalScore} />
            <section className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Category Breakdown</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Weighted for a <span className="text-violet-500 dark:text-violet-400">{REPO_TYPE_LABELS[data.context.repoType]}</span> — {data.context.typeReason.toLowerCase()}.
                  </p>
                </div>
                <span className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  {passedChecks.length}/{checks.length} passed
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.categories.map((category) => (
                  <CategoryScore key={category.name} category={category} />
                ))}
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CheckList title="Passed Checks" checks={passedChecks} tone="passed" />
            <CheckList title="Failed Checks" checks={failedChecks} tone="failed" />
          </div>

          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Upgrade Suggestions</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Actionable fixes generated from failed checks.
                </p>
              </div>
            </div>

            {failedChecks.length === 0 ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-200">
                No failed checks. This repository passes the current RepoDoctor MVP model.
              </div>
            ) : (
              <div className="grid gap-4">
                {failedChecks.map((check) => (
                  <SuggestionCard key={`${check.categoryName}-${check.id}`} check={check} />
                ))}
              </div>
            )}
          </section>

          <div className="py-10 text-center">
            <Link
              href="/"
              className="inline-flex rounded-md bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Scan another repo
            </Link>
          </div>
        </>
      )}

      {tab === "contribute" && (
        <div className="mt-6">
          <ContributeGuide
            owner={data.owner}
            repoName={data.repoName}
            defaultBranch={data.defaultBranch}
            hasContributing={data.hasContributing}
          />
        </div>
      )}

      {tab === "workflow" && (
        <div className="mt-6">
          <ActionsGenerator
            techStack={data.context.techStack}
            defaultBranch={data.defaultBranch}
            hasCi={data.hasCi}
          />
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function ReportLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-10 w-40 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="h-72 animate-pulse rounded-lg border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/70" />
        <div className="h-72 animate-pulse rounded-lg border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/70" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-lg border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/70" />
        <div className="h-96 animate-pulse rounded-lg border border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/70" />
      </div>
    </main>
  );
}

function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500 dark:text-red-300">
          Scan failed
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">Could not scan repository</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-md border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-violet-500/50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white"
          >
            Scan another repo
          </Link>
        </div>
      </section>
    </main>
  );
}

function readCachedScan(repoUrl: string): ScanResponse | null {
  try {
    const raw = window.sessionStorage.getItem("repodoctor:last-scan");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { repoUrl?: string; scan?: ScanResponse };
    return parsed.repoUrl === repoUrl && parsed.scan ? parsed.scan : null;
  } catch {
    return null;
  }
}
