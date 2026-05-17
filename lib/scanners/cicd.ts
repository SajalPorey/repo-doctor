import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanCiCd(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const hasWorkflowDirectory = paths.some((path) => path.startsWith(".github/workflows/"));
  const hasWorkflowFiles = paths.some(
    (path) =>
      path.startsWith(".github/workflows/") &&
      (path.endsWith(".yml") || path.endsWith(".yaml"))
  );

  const checks: RepoCheck[] = [
    {
      id: "github-workflows-dir",
      label: ".github/workflows directory exists",
      passed: hasWorkflowDirectory,
      points: 8,
      suggestion: {
        why: "A workflows directory is the standard place for GitHub Actions automation.",
        fix: "Create .github/workflows and add a CI workflow file.",
        example: ".github/workflows/ci.yml"
      }
    },
    {
      id: "github-workflow-files",
      label: "Workflow files exist",
      passed: hasWorkflowFiles,
      points: 7,
      suggestion: {
        why: "Without automated checks, bugs can slip into the main branch easily.",
        fix: "Create .github/workflows/ci.yml with build and test steps.",
        example: "name: CI\non: [push, pull_request]"
      }
    }
  ];

  return {
    name: "CI/CD",
    maxScore: 15,
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}
