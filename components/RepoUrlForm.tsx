"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { parseRepoUrl } from "@/lib/parseRepoUrl";

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

interface RepoUrlFormProps {
  initialUrl?: string;
  loading: boolean;
  error: string | null;
  onScan: (owner: string, repo: string) => void;
}

export default function RepoUrlForm({ initialUrl = "", loading, error: externalError, onScan }: RepoUrlFormProps) {
  const [repoUrl, setRepoUrl] = useState(initialUrl);
  const [localError, setLocalError] = useState("");
  
  useEffect(() => {
    if (initialUrl && !repoUrl) setRepoUrl(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const error = localError || externalError;
  const canSubmit = useMemo(() => repoUrl.trim().length > 0 && !loading, [repoUrl, loading]);

  const handleSubmit = (url = repoUrl) => {
    const validation = repoUrlSchema.safeParse(url);
    if (!validation.success) {
      setLocalError(validation.error.issues[0]?.message ?? "Enter a valid GitHub repository URL.");
      return;
    }
    setLocalError("");
    const parsed = parseRepoUrl(validation.data);
    onScan(parsed.owner, parsed.repo);
  };

  return (
    <div className="w-full">
      <form
        className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 shadow-2xl shadow-black/30 backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <label className="sr-only" htmlFor="repo-url">
          GitHub repository URL
        </label>
        <div className="flex flex-col gap-3">
          <input
            id="repo-url"
            value={repoUrl}
            onChange={(event) => {
              setRepoUrl(event.target.value);
              if (localError) setLocalError("");
            }}
            placeholder="https://github.com/owner/repo"
            className="min-h-12 w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-12 w-full rounded-md bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {loading ? "Scanning..." : "Scan Repo"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </form>

      {loading && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
