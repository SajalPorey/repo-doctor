export type CategoryName =
  | "Documentation"
  | "Security"
  | "CI/CD"
  | "Testing"
  | "Code Quality"
  | "Repo Hygiene";

export interface Suggestion {
  why: string;
  fix: string;
  example?: string;
}

export interface RepoCheck {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  suggestion: Suggestion;
}

export interface CategoryResult {
  name: CategoryName;
  score: number;
  maxScore: number;
  checks: RepoCheck[];
}

export interface ScanContext {
  paths: string[];
  readmeContent: string;
  packageJson: PackageJson | null;
}

export interface PackageJson {
  scripts?: Record<string, string>;
  eslintConfig?: unknown;
  prettier?: unknown;
  [key: string]: unknown;
}

export interface ScanResponse {
  repoName: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  totalScore: number;
  categories: CategoryResult[];
}

export interface ScanErrorResponse {
  error: {
    code: string;
    message: string;
    retryAfter?: string;
  };
}
