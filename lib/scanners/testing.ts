import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanTesting(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const scripts = context.packageJson?.scripts ?? {};

  const checks: RepoCheck[] = [
    {
      id: "test-folder-exists",
      label: "Test folder exists",
      passed: paths.some(hasTestFolderSegment),
      points: 5,
      suggestion: {
        why: "A clear test folder makes the project easier to verify and extend.",
        fix: "Add a tests, test, or __tests__ folder for automated tests.",
        example: "tests/"
      }
    },
    {
      id: "test-files-exist",
      label: "Test files exist",
      passed: paths.some(isTestFile),
      points: 5,
      suggestion: {
        why: "Test files prove important behavior is covered.",
        fix: "Add test files that match *.test.ts, *.spec.ts, *.test.js, or *.spec.js.",
        example: "src/score.test.ts"
      }
    },
    {
      id: "package-test-script",
      label: "package.json has a real test script",
      passed: hasUsefulTestScript(scripts),
      points: 5,
      suggestion: {
        why: "A test script gives contributors and CI one reliable command to validate changes.",
        fix: "Add a test script in package.json.",
        example: "\"test\": \"vitest run\""
      }
    }
  ];

  return {
    name: "Testing",
    maxScore: 15,
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}

function hasTestFolderSegment(path: string): boolean {
  const segments = path.split("/");
  return segments.includes("tests") || segments.includes("__tests__") || segments.includes("test");
}

function isTestFile(path: string): boolean {
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(path);
}

function hasUsefulTestScript(scripts: Record<string, string>): boolean {
  const testScript = scripts.test;
  return Boolean(testScript && !/no test specified/i.test(testScript));
}
