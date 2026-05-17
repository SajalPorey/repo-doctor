"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import CategoryScore from "@/components/CategoryScore";
import CheckList, { type DisplayCheck } from "@/components/CheckList";
import ScoreCard from "@/components/ScoreCard";
import SuggestionCard from "@/components/SuggestionCard";
import type { ScanErrorResponse, ScanResponse } from "@/types/scan";

interface ReportDashboardProps {
  initialRepo: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: ScanResponse }
  | { status: "error"; message: string };

export default function ReportDashboard({ initialRepo }: ReportDashboardProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const loadScan = useCallback(async () => {
    if (!initialRepo) {
      setState({
        status: "error",
        message: "Missing repository URL. Scan a repo from the home page."
      });
      return;
    }

    setState({ status: "loading" });

    const cached = readCachedScan(initialRepo);
    if (cached) {
      setState({ status: "ready", data: cached });
      return;
    }

    try {
      const response = await fetch(`/api/scan?repo=${encodeURIComponent(initialRepo)}`);
      const payload = (await response.json()) as ScanResponse | ScanErrorResponse;

      if (!response.ok || "error" in payload) {
        const message =
          "error" in payload ? payload.error.message : "Repo scan failed. Please retry.";
        throw new Error(message);
      }

      window.sessionStorage.setItem(
        "repodoctor:last-scan",
        JSON.stringify({
          repoUrl: initialRepo,
          scan: payload
        })
      );
      setState({ status: "ready", data: payload });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Network error. Please retry."
      });
    }
  }, [initialRepo]);

  useEffect(() => {
    void loadScan();
  }, [loadScan]);

  if (state.status === "loading") {
    return <ReportLoading />;
  }

  if (state.status === "error") {
    return <ReportError message={state.message} onRetry={() => void loadScan()} />;
  }

  return <ReportReady data={state.data} />;
}

function ReportReady({ data }: { data: ScanResponse }) {
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition hover:border-violet-500/50 hover:text-white"
      >
        Scan another repo
      </Link>

      <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
              Repository
            </p>
            <h1 className="mt-2 break-words font-mono text-2xl font-semibold text-white sm:text-3xl">
              {data.owner}/{data.repoName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
              {data.description || "No repository description provided."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
            <Metric label="Stars" value={data.stars.toLocaleString()} />
            <Metric label="Forks" value={data.forks.toLocaleString()} />
            <Metric label="Language" value={data.language} />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <ScoreCard score={data.totalScore} />
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Category Breakdown</h2>
              <p className="mt-1 text-sm text-zinc-500">Scored against the MVP health model.</p>
            </div>
            <span className="rounded-full border border-zinc-800 px-3 py-1 font-mono text-xs text-zinc-400">
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
            <h2 className="text-xl font-semibold text-white">Upgrade Suggestions</h2>
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
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3">
      <p className="truncate font-mono text-sm font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function ReportLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-10 w-40 animate-pulse rounded-md bg-zinc-800" />
      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="h-5 w-24 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="h-72 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/70" />
        <div className="h-72 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/70" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/70" />
        <div className="h-96 animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/70" />
      </div>
    </main>
  );
}

function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
          Scan failed
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Could not scan repository</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>
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
            className="rounded-md border border-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-violet-500/50 hover:text-white"
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
