import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanDocumentation(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());
  const readme = context.readmeContent.toLowerCase();

  const checks: RepoCheck[] = [
    {
      id: "readme-exists",
      label: "README.md exists",
      passed: paths.includes("readme.md"),
      points: 5,
      suggestion: {
        why: "A README is the front door of a repository and explains what the project does.",
        fix: "Add a README.md with project overview, setup, usage, and contribution notes.",
        example: "README.md"
      }
    },
    {
      id: "readme-install-steps",
      label: "README has install steps",
      passed: /\b(install|npm|yarn|pip)\b/i.test(readme),
      points: 4,
      suggestion: {
        why: "Contributors will not know how to run your project locally.",
        fix: "Add a ## Installation section with step-by-step commands.",
        example: "npm install\nnpm run dev"
      }
    },
    {
      id: "readme-usage-section",
      label: "README has usage guidance",
      passed: /\b(usage|example|how to use)\b/i.test(readme),
      points: 3,
      suggestion: {
        why: "Usage examples help users understand the project faster.",
        fix: "Add a ## Usage section with commands, screenshots, or API examples."
      }
    },
    {
      id: "license-exists",
      label: "LICENSE file exists",
      passed: hasAnyPath(paths, ["license", "license.md", "license.txt"]),
      points: 4,
      suggestion: {
        why: "Without a license, others legally cannot use, copy, or contribute to your code.",
        fix: "Add a LICENSE file. For open source, MIT License is most common.",
        example: "Visit choosealicense.com to pick one."
      }
    },
    {
      id: "contributing-exists",
      label: "CONTRIBUTING.md exists",
      passed: hasAnyPath(paths, ["contributing.md", ".github/contributing.md"]),
      points: 4,
      suggestion: {
        why: "Contribution guidelines make collaboration easier and reduce maintainer overhead.",
        fix: "Add CONTRIBUTING.md with setup, branch, commit, and pull request guidelines.",
        example: "CONTRIBUTING.md"
      }
    }
  ];

  return buildCategory("Documentation", 20, checks);
}

function hasAnyPath(paths: string[], candidates: string[]): boolean {
  return candidates.some((candidate) => paths.includes(candidate));
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
