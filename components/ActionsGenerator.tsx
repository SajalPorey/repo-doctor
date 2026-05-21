"use client";

import { useState } from "react";
import { generateWorkflows } from "@/lib/actionsGenerator";
import { getTestingGuide } from "@/lib/testingGuide";
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
  owner: string;
  repoName: string;
  techStack: TechStack;
  defaultBranch: string;
  hasCi: boolean;
  hasTests: boolean;
}

export default function ActionsGenerator({
  owner,
  repoName,
  techStack,
  defaultBranch,
  hasCi,
  hasTests,
}: ActionsGeneratorProps) {
  const workflows = generateWorkflows(techStack, defaultBranch, hasTests);
  const testingGuide = getTestingGuide(techStack);
  const [selected, setSelected] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTestGuide, setShowTestGuide] = useState(false);
  const workflow = workflows[selected];
  
  // Prevent "file already exists" error on GitHub if repo already has CI
  const [uniqueId] = useState(() => Math.random().toString(36).substring(2, 7));
  const actualFilename = hasCi ? `repodoctor-${uniqueId}-${workflow.filename}` : workflow.filename;

  const githubNewFileUrl = `https://github.com/${owner}/${repoName}/new/${defaultBranch}?filename=.github/workflows/${actualFilename}&value=${encodeURIComponent(workflow.yaml)}`;

  const stackLabel: Record<TechStack, string> = {
    typescript: "🟦 TypeScript",
    javascript: "🟨 JavaScript",
    python: "🐍 Python",
    rust: "🦀 Rust",
    go: "🐹 Go",
    java: "☕ Java",
    ruby: "💎 Ruby",
    php: "🐘 PHP",
    other: "📁 Other",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-zinc-200 bg-white/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-sm font-semibold text-zinc-900 truncate dark:text-white">Automate Your Tests (CI)</p>
            <p className="text-xs text-zinc-600 mt-0.5 truncate dark:text-zinc-500">
              Automatically check your {stackLabel[techStack]} code on every push or PR.
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

      {/* 1-Click Setup Box */}
      <div className="rounded-lg border border-violet-500/30 bg-violet-50/50 p-5 text-center dark:bg-violet-500/10">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">1-Click Setup</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
          Click the button below to open GitHub. The file will be created and filled with the correct configuration automatically. All you have to do is click &quot;Commit changes&quot;.
        </p>
        <a
          href={githubNewFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 transition"
        >
          Add to Repository
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full text-center text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition py-2"
      >
        {showAdvanced ? "Hide Advanced Setup ▲" : "Show Advanced Manual Setup ▼"}
      </button>

      {showAdvanced && (
        <>
          {/* Workflow info */}
          <div className="space-y-1 mt-2">
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
          <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Manual GitHub Setup</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Go to the <strong>Actions</strong> tab on your GitHub repository.</li>
              <li>Click <strong>New Workflow</strong> → <strong>set up a workflow yourself</strong>.</li>
              <li>Change the filename to <code className="text-violet-600 dark:text-violet-300">{workflow.filename}</code>.</li>
              <li>Paste the code above into the editor and click <strong>Commit changes...</strong>.</li>
            </ol>
          </div>
        </>
      )}

      {/* Testing Guide Section */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-white/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-sm font-semibold text-zinc-900 truncate dark:text-white">Wanna increase your testing score?</p>
            <p className="text-xs text-zinc-600 mt-0.5 truncate dark:text-zinc-500">
              Set up local tests using our 0 to 10 step-by-step guide.
            </p>
          </div>
          {hasTests ? (
            <span className="flex-shrink-0 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-50/80 px-2.5 py-1 text-xs text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              ✓ Tests found
            </span>
          ) : (
            <span className="flex-shrink-0 whitespace-nowrap rounded-full border border-red-500/30 bg-red-50/80 px-2.5 py-1 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
              No tests yet
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowTestGuide(!showTestGuide)}
        className="w-full text-center text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition py-2"
      >
        {showTestGuide ? "Hide Testing Setup Guide ▲" : "Show Testing Setup Guide ▼"}
      </button>

      {showTestGuide && (
        <div className="space-y-4">
          <div className="rounded-lg border border-violet-500/30 bg-violet-50/50 p-5 dark:bg-violet-500/10">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">{testingGuide.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{testingGuide.description}</p>
          </div>

          <div className="space-y-4">
            {testingGuide.steps.map((step, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 mb-3">{step.description}</p>
                {step.code && (
                  <div className="relative rounded-md border border-zinc-200 bg-zinc-50 overflow-hidden dark:border-zinc-700 dark:bg-zinc-950">
                    <div className="absolute right-2 top-2">
                      <CopyButton text={step.code} />
                    </div>
                    <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-700 font-mono dark:text-zinc-300">
                      {step.code}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
