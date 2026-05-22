import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanCiCd(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const hasWorkflowDirectory = paths.some((path) => path.startsWith(".github/workflows/"));
  const hasWorkflowFiles = paths.some(
    (path) =>
      path.startsWith(".github/workflows/") &&
      (path.endsWith(".yml") || path.endsWith(".yaml"))
  );

  const hasOtherCi = paths.some(
    (p) =>
      p === ".circleci/config.yml" ||
      p === ".travis.yml" ||
      p === "bitbucket-pipelines.yml" ||
      p === "gitlab-ci.yml" ||
      p === ".gitlab-ci.yml" ||
      p === "jenkinsfile"
  );

  const checks: RepoCheck[] = [
    {
      id: "github-workflows-dir",
      label: "CI/CD configuration exists",
      passed: context.techStack === "html" || context.repoType === "docs-only" || hasWorkflowDirectory || hasOtherCi,
      points: context.techStack === "html" || context.repoType === "docs-only" ? 0 : 8,
      suggestion: {
        why: "A workflows directory or CI config file is standard for project automation and testing.",
        fix: "Create .github/workflows and add a CI workflow file, or set up GitLab CI, CircleCI, etc.",
        example: ".github/workflows/ci.yml"
      }
    },
    {
      id: "github-workflow-files",
      label: "CI/CD workflow files exist",
      passed: context.techStack === "html" || context.repoType === "docs-only" || hasWorkflowFiles || hasOtherCi,
      points: context.techStack === "html" || context.repoType === "docs-only" ? 0 : 7,
      suggestion: {
        why: "Without automated checks, bugs can slip into the main branch easily.",
        fix: "Create .github/workflows/ci.yml with build and test steps, or add a GitLab/CircleCI pipeline config.",
        example: "name: CI\non: [push, pull_request]"
      }
    }
  ];

  const maxScore = checks.reduce((total, check) => total + check.points, 0);

  return {
    name: "CI/CD",
    maxScore,
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}

