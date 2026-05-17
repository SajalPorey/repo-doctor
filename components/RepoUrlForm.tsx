"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { parseRepoUrl } from "@/lib/parseRepoUrl";
import type { ScanErrorResponse, ScanResponse } from "@/types/scan";

const repoUrlSchema = z.string().trim().min(1, "Enter a GitHub repository URL.").refine(
  (value) => {
    try {
      parseRepoUrl(value);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Use a valid GitHub repository URL like https://github.com/owner/repo."
  }
);

const examples = [
  {
    label: "vercel/next.js",
    url: "https://github.com/vercel/next.js"
  },
  {
    label: "facebook/react",
    url: "https://github.com/facebook/react"
  },
  {
    label: "microsoft/vscode",
    url: "https://github.com/microsoft/vscode"
  }
];

export default function RepoUrlForm() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const canSubmit = useMemo(() => repoUrl.trim().length > 0 && !isScanning, [repoUrl, isScanning]);

  async function scanRepo(nextRepoUrl = repoUrl) {
    const validation = repoUrlSchema.safeParse(nextRepoUrl);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Enter a valid GitHub repository URL.");
      return;
    }

    setError("");
    setIsScanning(true);

    try {
      const response = await fetch(`/api/scan?repo=${encodeURIComponent(validation.data)}`);
      const payload = (await response.json()) as ScanResponse | ScanErrorResponse;

      if (!response.ok || "error" in payload) {
        const message =
          "error" in payload
            ? payload.error.message
            : "Repo scan failed. Check the URL and try again.";
        throw new Error(message);
      }

      window.sessionStorage.setItem(
        "repodoctor:last-scan",
        JSON.stringify({
          repoUrl: validation.data,
          scan: payload
        })
      );

      router.push(`/report?repo=${encodeURIComponent(validation.data)}`);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Network error. Please retry.");
      setIsScanning(false);
    }
  }

  return (
    <div className="w-full">
      <form
        className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 shadow-2xl shadow-black/30 backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault();
          void scanRepo();
        }}
      >
        <label className="sr-only" htmlFor="repo-url">
          GitHub repository URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="repo-url"
            value={repoUrl}
            onChange={(event) => {
              setRepoUrl(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="https://github.com/owner/repo"
            className="min-h-14 flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-4 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
            disabled={isScanning}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-14 rounded-md bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {isScanning ? "Scanning..." : "Scan Repo"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {examples.map((example) => (
          <button
            key={example.url}
            type="button"
            onClick={() => {
              setRepoUrl(example.url);
              void scanRepo(example.url);
            }}
            disabled={isScanning}
            className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-violet-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {example.label}
          </button>
        ))}
      </div>

      {isScanning ? (
        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="h-20 animate-pulse rounded-md bg-zinc-800/80" />
            <div className="h-20 animate-pulse rounded-md bg-zinc-800/80" />
            <div className="h-20 animate-pulse rounded-md bg-zinc-800/80" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
