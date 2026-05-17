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

let octokitInstance: Octokit | null = null;

export function getOctokit(): Octokit {
  if (octokitInstance) return octokitInstance;
  
  let token = undefined;
  if (typeof window !== "undefined") {
    token = window.localStorage.getItem("repodoctor_github_token") || undefined;
  }
  if (!token && typeof process !== "undefined" && process.env) {
    token = process.env.GITHUB_TOKEN?.trim() || undefined;
  }

  octokitInstance = new Octokit({
    auth: token,
    userAgent: "RepoDoctor/0.1.0"
  });
  
  return octokitInstance;
}

export function resetOctokit() {
  octokitInstance = null;
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<GitHubRepoMetadata> {
  const { data } = await getOctokit().rest.repos.get({ owner, repo });

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
  const { data } = await getOctokit().rest.git.getTree({
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
  const { data } = await getOctokit().rest.repos.getContent({
    owner,
    repo,
    path,
    ref
  });

  if (Array.isArray(data) || data.type !== "file" || typeof data.content !== "string") {
    return "";
  }

  // Browser-compatible base64 to utf8 decoding
  try {
    // Escape and decodeURIComponent handles utf8 characters correctly after atob
    const binary = atob(data.content.replace(/\n/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error("Failed to decode base64 content", e);
    return "";
  }
}

export function isGitHubApiError(error: unknown): error is GitHubApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  );
}
