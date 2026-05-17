import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanCodeQuality(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());

  const checks: RepoCheck[] = [
    {
      id: "package-json-exists",
      label: "package.json exists",
      passed: paths.includes("package.json"),
      points: 5,
      suggestion: {
        why: "package.json documents scripts, dependencies, metadata, and tooling for JavaScript projects.",
        fix: "Add package.json if this repository is a Node or frontend project.",
        example: "npm init -y"
      }
    },
    {
      id: "eslint-config-exists",
      label: "ESLint config exists",
      passed: hasEslintConfig(paths, context.packageJson),
      points: 5,
      suggestion: {
        why: "Linting catches common bugs and keeps code style consistent.",
        fix: "Add ESLint config and a lint script.",
        example: "eslint.config.mjs"
      }
    },
    {
      id: "prettier-config-exists",
      label: "Prettier config exists",
      passed: hasPrettierConfig(paths, context.packageJson),
      points: 5,
      suggestion: {
        why: "Formatting rules reduce noisy diffs and style debates.",
        fix: "Add a Prettier config file or package.json prettier field.",
        example: ".prettierrc"
      }
    },
    {
      id: "tsconfig-exists",
      label: "tsconfig.json exists",
      passed: paths.includes("tsconfig.json"),
      points: 5,
      suggestion: {
        why: "TypeScript configuration makes type checking explicit and repeatable.",
        fix: "Add tsconfig.json if the project uses TypeScript.",
        example: "tsconfig.json"
      }
    }
  ];

  return {
    name: "Code Quality",
    maxScore: 20,
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
