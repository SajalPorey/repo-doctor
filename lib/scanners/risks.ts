import type { RiskItem, ScanContext } from "@/types/scan";

export function scanRisks(context: ScanContext): RiskItem[] {
  const paths = context.paths.map((p) => p.toLowerCase());
  const risks: RiskItem[] = [];

  // ── 🔴 HIGH ──────────────────────────────────────────────────────────────────

  // DB migrations detected
  const hasMigrations = paths.some(
    (p) =>
      p.startsWith("migrations/") ||
      p.includes("/migrations/") ||
      p.startsWith("db/migrations/") ||
      p.startsWith("database/migrations/") ||
      p.startsWith("alembic/") // Python Alembic
  );
  if (hasMigrations) {
    risks.push({
      id: "db-migrations-detected",
      severity: "high",
      title: "Database migrations present",
      description:
        "This repo contains database migration files. Merging directly to main without a staging run can corrupt production data.",
      fix: "Always run migrations on a staging environment first. Use a separate branch for migration PRs and never force-merge.",
    });
  }

  // .env file committed (not .env.example or .env.sample)
  const hasEnvFile = paths.some(
    (p) =>
      p === ".env" ||
      (p.startsWith(".env.") &&
        !p.includes("example") &&
        !p.includes("sample") &&
        !p.includes("template") &&
        !p.includes("local"))
  );
  if (hasEnvFile) {
    risks.push({
      id: "env-file-committed",
      severity: "high",
      title: ".env file may be committed",
      description:
        "A .env file appears to be tracked in this repository. This can expose API keys, database credentials, and secrets publicly.",
      fix: "Remove .env from git tracking: `git rm --cached .env`, then add .env to .gitignore immediately.",
    });
  }

  // No .gitignore at all
  const hasGitignore = paths.includes(".gitignore");
  if (!hasGitignore) {
    risks.push({
      id: "no-gitignore",
      severity: "high",
      title: "No .gitignore file",
      description:
        "Without a .gitignore, build artifacts, node_modules, .env files, and IDE files can be accidentally committed.",
      fix: "Add a .gitignore using GitHub's template: github.com/github/gitignore or run `npx gitignore node` for Node projects.",
    });
  }

  // Both lockfiles present (npm + yarn conflict)
  const hasPackageLock = paths.includes("package-lock.json");
  const hasYarnLock = paths.includes("yarn.lock");
  const hasPnpmLock = paths.includes("pnpm-lock.yaml");
  const lockfileCount = [hasPackageLock, hasYarnLock, hasPnpmLock].filter(Boolean).length;
  if (lockfileCount > 1) {
    risks.push({
      id: "multiple-lockfiles",
      severity: "high",
      title: "Multiple package manager lockfiles detected",
      description:
        "Both " +
        [hasPackageLock && "package-lock.json", hasYarnLock && "yarn.lock", hasPnpmLock && "pnpm-lock.yaml"]
          .filter(Boolean)
          .join(" and ") +
        " are present. This causes dependency version conflicts and inconsistent installs across machines.",
      fix: "Pick one package manager and delete the other lockfile(s). Update CI and README accordingly.",
    });
  }

  // ── 🟡 MEDIUM ────────────────────────────────────────────────────────────────

  // No CI config at all
  const hasCi = paths.some(
    (p) =>
      p.startsWith(".github/workflows/") ||
      p === ".circleci/config.yml" ||
      p === ".travis.yml" ||
      p === "bitbucket-pipelines.yml" ||
      p === "gitlab-ci.yml" ||
      p === ".gitlab-ci.yml" ||
      p === "Jenkinsfile"
  );
  if (!hasCi) {
    risks.push({
      id: "no-ci",
      severity: "medium",
      title: "No CI/CD pipeline configured",
      description:
        "Without automated checks, broken code can be merged directly to the main branch with no safety net.",
      fix: "Add a GitHub Actions workflow in .github/workflows/. Start with a simple build + test job.",
    });
  }

  // Merge conflicts markers in files (can't read content, skip)
  // Force push history (can't detect from tree, skip)

  // Large binary files tracked
  const hasBinaries = paths.some(
    (p) =>
      p.endsWith(".zip") ||
      p.endsWith(".tar.gz") ||
      p.endsWith(".exe") ||
      p.endsWith(".dll") ||
      p.endsWith(".dmg") ||
      p.endsWith(".pkg")
  );
  if (hasBinaries) {
    risks.push({
      id: "binaries-tracked",
      severity: "medium",
      title: "Binary files tracked in git",
      description:
        "Binary files (.zip, .exe, .dll, etc.) in git inflate repo size and cause painful merge conflicts.",
      fix: "Use Git LFS for large binaries, or remove them and serve from a CDN/release assets instead.",
    });
  }

  // Solo project with no tests is risky
  const hasTests = paths.some(
    (p) =>
      p.includes("test") ||
      p.includes("spec") ||
      p.endsWith("_test.go") ||
      p.endsWith("_test.py") ||
      p.endsWith("_test.rs")
  );
  const stars = (context as any).stars ?? 0; // stars not in ScanContext but won't cause error
  if (!hasTests) {
    risks.push({
      id: "no-tests-risky-merge",
      severity: "medium",
      title: "No tests — merges are unverified",
      description:
        "There are no test files in this repository. Any PR merge could silently break existing functionality.",
      fix: "Add at least basic tests before accepting contributions. Even a few tests dramatically reduce regression risk.",
    });
  }

  // ── 🔵 INFO ──────────────────────────────────────────────────────────────────

  // No CHANGELOG
  const hasChangelog = paths.some(
    (p) => p === "changelog.md" || p === "changelog" || p === "history.md" || p === "releases.md"
  );
  if (!hasChangelog) {
    risks.push({
      id: "no-changelog",
      severity: "info",
      title: "No CHANGELOG.md",
      description:
        "Contributors and users have no way to know what changed between versions.",
      fix: "Add CHANGELOG.md and update it with each release. Use Keep a Changelog format: keepachangelog.com",
    });
  }

  // No issue templates
  const hasIssueTemplates = paths.some(
    (p) => p.startsWith(".github/issue_template") || p.startsWith(".github/issues/")
  );
  if (!hasIssueTemplates) {
    risks.push({
      id: "no-issue-templates",
      severity: "info",
      title: "No issue templates",
      description:
        "Without issue templates, bug reports will be inconsistent and missing key information.",
      fix: "Add .github/ISSUE_TEMPLATE/bug_report.md to guide contributors.",
    });
  }

  return risks;
}
