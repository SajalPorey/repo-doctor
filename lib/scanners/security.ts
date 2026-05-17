import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanSecurity(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const readme = context.readmeContent;

  const checks: RepoCheck[] = [
    {
      id: "env-not-committed",
      label: ".env file is not committed",
      passed: !hasFileNamed(paths, ".env"),
      points: 6,
      suggestion: {
        why: "Committed .env files often leak real API keys, database URLs, and service credentials.",
        fix: "Remove .env from git history if needed, add it to .gitignore, and keep only .env.example.",
        example: ".env"
      }
    },
    {
      id: "env-example-exists",
      label: ".env.example exists",
      passed: hasFileNamed(paths, ".env.example"),
      points: 4,
      suggestion: {
        why: "New contributors will not know what environment variables are needed.",
        fix: "Create .env.example with all required keys and no real values.",
        example: "GITHUB_TOKEN=\nDATABASE_URL="
      }
    },
    {
      id: "readme-no-secrets",
      label: "README has no obvious hardcoded secrets",
      passed: !/(API[_-]?KEY|SECRET|TOKEN|PASSWORD)/i.test(readme),
      points: 5,
      suggestion: {
        why: "Secrets in docs are easy to copy, leak, and accidentally reuse.",
        fix: "Replace real-looking secrets with placeholders and rotate any exposed credentials.",
        example: "API_KEY=your_api_key_here"
      }
    },
    {
      id: "dependency-lockfile-exists",
      label: "Dependency lockfile or requirements file exists",
      passed: hasAnyPath(paths, [
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
        "poetry.lock",
        "requirements.txt"
      ]),
      points: 5,
      suggestion: {
        why: "Lockfiles make installs reproducible and reduce surprise dependency changes.",
        fix: "Commit the lockfile produced by your package manager.",
        example: "package-lock.json"
      }
    }
  ];

  return buildCategory("Security", 20, checks);
}

function hasAnyPath(paths: string[], candidates: string[]): boolean {
  return candidates.some((candidate) => paths.includes(candidate));
}

function hasFileNamed(paths: string[], fileName: string): boolean {
  return paths.some((path) => path.split("/").pop() === fileName);
}

function buildCategory(
  name: CategoryResult["name"],
  maxScore: number,
  checks: RepoCheck[]
): CategoryResult {
  return {
    name,
    maxScore,
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}
