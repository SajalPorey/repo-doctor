"use client";

declare var chrome: any;

import { useEffect, useState, useCallback } from "react";
import RepoUrlForm from "@/components/RepoUrlForm";
import ReportDashboard from "@/components/ReportDashboard";
import ScanHistory from "@/components/ScanHistory";
import { useRepoScanner } from "@/hooks/useRepoScanner";
import { resetOctokit } from "@/lib/github";

export default function HomePage() {
  const { scanRepo, loading, error, result } = useRepoScanner();
  const [initialUrl, setInitialUrl] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Priority 1: URL params — loaded inside the content script iframe
    const params = new URLSearchParams(window.location.search);
    const ownerParam = params.get("owner");
    const repoParam = params.get("repo");
    if (ownerParam && repoParam) {
      void scanRepo(ownerParam, repoParam);
      setToken(window.localStorage.getItem("repodoctor_github_token") || "");
      return;
    }

    // Priority 2: chrome.tabs — loaded as a popup
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        const url = tabs[0]?.url;
        if (url && url.includes("github.com/")) {
          setInitialUrl(url);
          const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (match) {
            void scanRepo(match[1], match[2]);
          }
        }
      });
    }

    setToken(window.localStorage.getItem("repodoctor_github_token") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToken = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("repodoctor_github_token", token.trim());
      resetOctokit();
      setShowSettings(false);
    }
  };

  return (
    <main className="flex min-h-screen items-start justify-center p-4">
      <section className="w-full max-w-4xl">
        <div className="mx-auto mb-6 flex items-center justify-between text-center">
          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-violet-300">
            RepoDoctor Extension
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-zinc-400 hover:text-white"
            title="Settings"
          >
            ⚙️
          </button>
        </div>

        {showSettings && (
          <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
            <h3 className="mb-2 text-sm font-semibold text-white">GitHub Settings</h3>
            <p className="mb-3 text-xs text-zinc-400">
              Set a Personal Access Token (PAT) to increase the API rate limit. 
              The token is stored locally in your browser.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
              <button 
                onClick={saveToken}
                className="rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {!result && (
          <div className="space-y-8">
            <RepoUrlForm 
              initialUrl={initialUrl} 
              loading={loading} 
              error={error} 
              onScan={(owner, repo) => scanRepo(owner, repo)} 
            />
            
            <div className="pt-8 border-t border-zinc-800/60">
              <ScanHistory onRescan={(owner, repo) => scanRepo(owner, repo)} />
            </div>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <button 
              onClick={() => window.location.reload()}
              className="mb-4 text-sm text-zinc-400 hover:text-white"
            >
              ← Scan another repo
            </button>
            <ReportDashboard data={result} />
          </div>
        )}
      </section>
    </main>
  );
}
