import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";
import { getStackQualityChecks } from "@/lib/scanners/stackChecks";

export function scanCodeQuality(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const isJsStack = context.techStack === "javascript" || context.techStack === "typescript";
  const isTs = context.techStack === "typescript";

  // JS/TS-specific generic checks
  const jsChecks: RepoCheck[] = isJsStack
    ? [
        {
          id: "package-json-exists",
          label: "package.json exists",
          passed: paths.includes("package.json"),
          points: 5,
          suggestion: {
            why: "package.json documents scripts, dependencies, and metadata for Node/frontend projects.",
            fix: "Add package.json if this is a Node or frontend project.",
            example: "npm init -y"
          }
        },
        {
          id: "eslint-config-exists",
          label: "Linter config exists (ESLint, Biome, Deno)",
          passed: hasEslintConfig(paths, context.packageJson) || hasModernTools(paths),
          points: 5,
          suggestion: {
            why: "Linting catches common bugs and keeps code style consistent.",
            fix: "Add an ESLint config file.",
            example: "eslint.config.mjs"
          }
        },
        {
          id: "prettier-config-exists",
          label: "Formatter config exists (Prettier, Biome, Deno)",
          passed: hasPrettierConfig(paths, context.packageJson) || hasModernTools(paths),
          points: 5,
          suggestion: {
            why: "Formatting rules reduce noisy diffs and style debates in code review.",
            fix: "Add .prettierrc or configure in package.json.",
            example: ".prettierrc"
          }
        },
        ...(isTs
          ? [
              {
                id: "tsconfig-exists",
                label: "tsconfig.json exists",
                passed: paths.includes("tsconfig.json"),
                points: 5,
                suggestion: {
                  why: "TypeScript configuration makes type checking explicit and repeatable.",
                  fix: "Add tsconfig.json.",
                  example: "tsconfig.json"
                }
              } satisfies RepoCheck
            ]
          : [])
      ]
    : [];

  // Stack-specific checks (Python: ruff/mypy, Rust: rustfmt/deny, Go: golangci)
  const stackChecks = getStackQualityChecks(context);

  const checks = [...jsChecks, ...stackChecks];
  const maxScore = checks.reduce((t, c) => t + c.points, 0);

  return {
    name: "Code Quality",
    maxScore,
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}

function hasEslintConfig(paths: string[], packageJson: ScanContext["packageJson"]): boolean {
  return (
    paths.some(
      (path) =>
        path === ".eslintrc" ||
        path.startsWith(".eslintrc.") ||
        path === "eslint.config.js" ||
        path === "eslint.config.mjs" ||
        path === "eslint.config.cjs"
    ) || Boolean(packageJson?.eslintConfig)
  );
}

function hasPrettierConfig(paths: string[], packageJson: ScanContext["packageJson"]): boolean {
  return (
    paths.some(
      (path) =>
        path === ".prettierrc" ||
        path.startsWith(".prettierrc.") ||
        path === "prettier.config.js" ||
        path === "prettier.config.mjs" ||
        path === "prettier.config.cjs"
    ) || Boolean(packageJson?.prettier)
  );
}

function hasModernTools(paths: string[]): boolean {
  return paths.some(p => p === "biome.json" || p === "biome.jsonc" || p === "deno.json" || p === "deno.jsonc");
}
