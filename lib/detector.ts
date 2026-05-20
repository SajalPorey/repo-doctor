import type { PackageJson } from "@/types/scan";

export type RepoType = "library" | "web-app" | "cli-tool" | "research" | "monorepo" | "docs-only" | "unknown";
export type TechStack = "typescript" | "javascript" | "python" | "go" | "rust" | "java" | "ruby" | "php" | "other";
export type MaturityLevel = "hobby" | "growing" | "production";

export interface RepoContext {
  repoType: RepoType;
  techStack: TechStack;
  maturity: MaturityLevel;
  maturityReason: string;
  typeReason: string;
}

// ── Repo Type Detection ────────────────────────────────────────────────────────
export function detectRepoType(paths: string[], packageJson?: PackageJson | null): RepoType {
  // Monorepo
  const hasLerna = paths.includes("lerna.json");
  const hasPnpmWorkspace = paths.includes("pnpm-workspace.yaml");
  const hasPackagesDir = paths.some((p) => p.startsWith("packages/") && p.split("/").length > 1);
  const hasAppsDir = paths.some((p) => p.startsWith("apps/") && p.split("/").length > 1);
  if (hasLerna || hasPnpmWorkspace || (hasPackagesDir && hasAppsDir)) return "monorepo";

  // Research / ML
  const hasNotebooks = paths.some((p) => p.endsWith(".ipynb"));
  const hasModelsDir = paths.some((p) => p.startsWith("models/") || p.includes("/models/"));
  const hasDataDir = paths.some((p) => p.startsWith("data/") || p.includes("/data/"));
  const hasRequirements = paths.includes("requirements.txt");
  if (hasNotebooks || (hasRequirements && (hasModelsDir || hasDataDir))) return "research";

  // Docs-only
  const nonDocFiles = paths.filter(
    (p) => !p.endsWith(".md") && !p.endsWith(".txt") && !p.endsWith(".rst") && !p.startsWith(".") && p !== "LICENSE"
  );
  if (nonDocFiles.length === 0 && paths.length > 0) return "docs-only";

  // CLI tool
  const hasBin = packageJson?.bin !== undefined;
  const hasCmdDir = paths.some((p) => p.startsWith("cmd/"));
  const hasCliFile = paths.some((p) => /cli\.(ts|js|go|py)$/.test(p));
  if (hasBin || hasCmdDir || hasCliFile) return "cli-tool";

  // Library (has exports, no app structure)
  const hasMain = (packageJson as any)?.main !== undefined;
  const hasModule = (packageJson as any)?.module !== undefined;
  const hasExports = (packageJson as any)?.exports !== undefined;
  const noPublicDir = !paths.some((p) => p === "public" || p.startsWith("public/"));
  const noAppOrPages = !paths.some((p) => p.startsWith("pages/") || (p.startsWith("app/") && p.includes("page.")));
  if ((hasMain || hasModule || hasExports) && noPublicDir && noAppOrPages) return "library";

  // Web app
  const hasNextConfig = paths.some((p) => p.startsWith("next.config"));
  const hasViteConfig = paths.some((p) => p.startsWith("vite.config"));
  const hasPagesDir = paths.some((p) => p.startsWith("pages/"));
  const hasAppDir = paths.some((p) => p.startsWith("app/") && p.includes("page."));
  const hasDockerfile = paths.some((p) => p === "Dockerfile" || p.endsWith(".dockerfile"));
  if (hasNextConfig || hasViteConfig || hasPagesDir || hasAppDir || hasDockerfile) return "web-app";

  return "unknown";
}

// ── Tech Stack Detection ───────────────────────────────────────────────────────
export function detectTechStack(paths: string[]): TechStack {
  if (paths.some((p) => ["setup.py", "pyproject.toml", "requirements.txt"].includes(p))) return "python";
  if (paths.includes("Cargo.toml")) return "rust";
  if (paths.includes("go.mod")) return "go";
  if (paths.some((p) => ["pom.xml", "build.gradle", "build.gradle.kts"].includes(p))) return "java";
  if (paths.includes("Gemfile")) return "ruby";
  if (paths.includes("composer.json")) return "php";
  if (paths.includes("tsconfig.json") || paths.some((p) => p.endsWith(".ts") || p.endsWith(".tsx"))) return "typescript";
  if (paths.some((p) => p.endsWith(".js") || p.endsWith(".jsx") || p.endsWith(".mjs"))) return "javascript";
  return "other";
}

// ── Maturity Detection ─────────────────────────────────────────────────────────
export function detectMaturity(
  stars: number,
  forks: number,
  createdAt: string
): { maturity: MaturityLevel; reason: string } {
  const ageInDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const ageInMonths = Math.floor(ageInDays / 30);

  if (stars >= 1000 || forks >= 200) {
    return { maturity: "production", reason: `${stars.toLocaleString()} stars · ${ageInMonths} months old` };
  }
  if (stars >= 50 || forks >= 10 || ageInDays >= 180) {
    return { maturity: "growing", reason: `${stars} stars · ${ageInMonths} months old` };
  }
  return { maturity: "hobby", reason: `${stars} stars · ${ageInDays} days old` };
}

// ── Context Builder ────────────────────────────────────────────────────────────
export function buildRepoContext(
  paths: string[],
  stars: number,
  forks: number,
  createdAt: string,
  packageJson?: PackageJson | null
): RepoContext {
  const repoType = detectRepoType(paths, packageJson);
  const techStack = detectTechStack(paths);
  const { maturity, reason: maturityReason } = detectMaturity(stars, forks, createdAt);

  const typeReasons: Record<RepoType, string> = {
    library: "Has entry point exports, no app directory",
    "web-app": "Has Next.js / Vite / app directory structure",
    "cli-tool": "Has bin field or cmd/ directory",
    research: "Has Jupyter notebooks or ML data directories",
    monorepo: "Has packages/ + apps/ workspace layout",
    "docs-only": "Contains mostly documentation files",
    unknown: "Could not determine type from file structure",
  };

  return { repoType, techStack, maturity, maturityReason, typeReason: typeReasons[repoType] };
}

// ── Category Weight Multipliers per Repo Type ──────────────────────────────────
// These affect the totalScore calculation — higher weight = category matters more.
export const CATEGORY_WEIGHTS: Record<RepoType, Record<string, number>> = {
  library:     { Documentation: 1.5, Security: 1.3, "CI/CD": 1.0, Testing: 1.2, "Code Quality": 1.0, "Repo Hygiene": 0.8 },
  "web-app":   { Documentation: 1.0, Security: 1.2, "CI/CD": 1.5, Testing: 1.3, "Code Quality": 1.2, "Repo Hygiene": 1.0 },
  "cli-tool":  { Documentation: 1.3, Security: 1.0, "CI/CD": 1.2, Testing: 1.3, "Code Quality": 1.2, "Repo Hygiene": 0.8 },
  research:    { Documentation: 1.8, Security: 0.5, "CI/CD": 0.5, Testing: 0.5, "Code Quality": 0.8, "Repo Hygiene": 0.8 },
  monorepo:    { Documentation: 1.0, Security: 1.0, "CI/CD": 1.5, Testing: 1.2, "Code Quality": 1.3, "Repo Hygiene": 1.2 },
  "docs-only": { Documentation: 2.0, Security: 0.3, "CI/CD": 0.3, Testing: 0.3, "Code Quality": 0.5, "Repo Hygiene": 0.8 },
  unknown:     { Documentation: 1.0, Security: 1.0, "CI/CD": 1.0, Testing: 1.0, "Code Quality": 1.0, "Repo Hygiene": 1.0 },
};
