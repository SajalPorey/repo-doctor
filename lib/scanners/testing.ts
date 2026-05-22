import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";
import { getStackTestingChecks } from "@/lib/scanners/stackChecks";

export function scanTesting(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const scripts = context.packageJson?.scripts ?? {};
  const isJsStack = context.techStack === "javascript" || context.techStack === "typescript";
  const isPython = context.techStack === "python";
  const isRust = context.techStack === "rust";
  const isGo = context.techStack === "go";

  // Generic checks — only run if relevant to stack
  const genericChecks: RepoCheck[] = [];

  // Test folder: skip for Rust (uses src/ inline tests) and Go (files alongside code)
  if (!isRust && !isGo) {
    genericChecks.push({
      id: "test-folder-exists",
      label: "Test folder exists",
      passed: context.techStack === "html" || context.repoType === "docs-only" || paths.some(hasTestFolderSegment),
      points: context.techStack === "html" || context.repoType === "docs-only" ? 0 : 5,
      suggestion: {
        why: "A clear test folder makes the project easier to verify and extend.",
        fix: isPython
          ? "Add a tests/ folder with test_*.py files."
          : "Add a tests, test, or __tests__ folder.",
        example: isPython ? "tests/test_main.py" : "tests/"
      }
    });
  }

  // Test files: JS/TS-specific pattern
  if (isJsStack) {
    genericChecks.push({
      id: "test-files-exist",
      label: "Test files exist (*.test.ts / *.spec.ts)",
      passed: context.techStack === "html" || paths.some(isJsTestFile),
      points: context.techStack === "html" ? 0 : 5,
      suggestion: {
        why: "Test files prove important behavior is covered.",
        fix: "Add test files matching *.test.ts, *.spec.ts, *.test.js, or *.spec.js.",
        example: "src/score.test.ts"
      }
    });

    // npm test script — only meaningful for JS
    genericChecks.push({
      id: "package-test-script",
      label: "package.json has a real test script",
      passed: context.techStack === "html" || hasUsefulTestScript(scripts),
      points: context.techStack === "html" ? 0 : 5,
      suggestion: {
        why: "A test script gives contributors and CI one reliable command.",
        fix: "Add a test script in package.json.",
        example: "\"test\": \"vitest run\""
      }
    });
  }

  // Stack-specific checks
  const stackChecks = getStackTestingChecks(context);

  const checks = [...genericChecks, ...stackChecks];
  const maxScore = checks.reduce((t, c) => t + c.points, 0);

  return {
    name: "Testing",
    maxScore: maxScore || 15,
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}

function hasTestFolderSegment(path: string): boolean {
  const segments = path.split("/");
  return segments.includes("tests") || segments.includes("__tests__") || segments.includes("test");
}

function isJsTestFile(path: string): boolean {
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(path);
}

function hasUsefulTestScript(scripts: Record<string, string>): boolean {
  const testScript = scripts.test;
  if (!testScript) return false;
  const trimmed = testScript.trim();
  return !/no test specified/i.test(trimmed) && !/^echo\b/i.test(trimmed) && trimmed !== "";
}
