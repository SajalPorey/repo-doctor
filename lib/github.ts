import { Octokit } from "@octokit/rest";

export interface GitHubRepoMetadata {
  repoName: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  defaultBranch: string;
  private: boolean;
}

export interface RepoTreeItem {
  path: string;
  type: string;
}

export interface GitHubApiError {
  status: number;
  message: string;
  response?: {
    headers?: Record<string, string | number | undefined>;
  };
}

const token = process.env.GITHUB_TOKEN?.trim();

export const octokit = new Octokit({
  auth: token || undefined,
  userAgent: "RepoDoctor/0.1.0"
});

export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<GitHubRepoMetadata> {
  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    repoName: data.name,
    owner: data.owner.login,
    description: data.description ?? "",
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    language: data.language ?? "Unknown",
    defaultBranch: data.default_branch ?? "main",
    private: data.private
  };
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string
): Promise<RepoTreeItem[]> {
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true"
  });

  return data.tree
    .filter((item) => Boolean(item.path))
    .map((item) => ({
      path: item.path ?? "",
      type: item.type ?? "unknown"
    }));
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref
  });

  if (Array.isArray(data) || data.type !== "file" || typeof data.content !== "string") {
    return "";
  }

  return Buffer.from(data.content, "base64").toString("utf8");
}

export function isGitHubApiError(error: unknown): error is GitHubApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}
