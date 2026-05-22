import type { CategoryResult, RepoCheck, ScanContext } from "@/types/scan";

export function scanHygiene(context: ScanContext): CategoryResult {
  const paths = context.paths.map((path) => path.toLowerCase());

  const checks: RepoCheck[] = [
    {
      id: "gitignore-exists",
      label: ".gitignore exists",
      passed: context.techStack === "html" || context.repoType === "docs-only" || paths.includes(".gitignore"),
      points: context.techStack === "html" || context.repoType === "docs-only" ? 0 : 5,
      suggestion: {
        why: ".gitignore prevents build output, dependencies, and secrets from being committed.",
        fix: "Add a .gitignore that matches your language and framework.",
        example: "node_modules\n.env\n.next",
        autoFix: {
          filename: ".gitignore",
          content: "node_modules/\n.env\n.DS_Store\ndist/\nbuild/"
        }
      }
    },
    {
      id: "src-folder-exists",
      label: "src folder or equivalent exists",
      passed: context.techStack === "html" || paths.some((path) => path.startsWith("src/") || path.startsWith("app/") || path.startsWith("pages/") || path.startsWith("cmd/")),
      points: context.techStack === "html" ? 0 : 3,
      suggestion: {
        why: "A src folder keeps application code separate from configuration and documentation.",
        fix: "Move application source files into a src directory when it fits the project.",
        example: "src/"
      }
    },
    {
      id: "no-unnecessary-system-files",
      label: "No obvious unnecessary system files",
      passed: !paths.some(isUnnecessarySystemFile),
      points: 2,
      suggestion: {
        why: "System files add noise and make the repository look less maintained.",
        fix: "Delete DS_Store and Thumbs.db files, then add them to .gitignore.",
        example: ".DS_Store\nThumbs.db"
      }
    }
  ];

  return {
    name: "Repo Hygiene",
    maxScore: checks.reduce((total, check) => total + check.points, 0),
    score: checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0),
    checks
  };
}

function isUnnecessarySystemFile(path: string): boolean {
  const fileName = path.split("/").pop();
  return fileName === ".ds_store" || fileName === "thumbs.db";
}
