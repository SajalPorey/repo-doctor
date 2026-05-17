export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

const OWNER_PATTERN = /^[a-zA-Z0-9-]+$/;
const REPO_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function parseRepoUrl(input: string): ParsedRepoUrl {
  const raw = input.trim();

  if (!raw) {
    throw new Error("Enter a GitHub repository URL.");
  }

  const sshMatch = raw.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
  if (sshMatch) {
    return validateParts(sshMatch[1], sshMatch[2]);
  }

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error("Enter a valid GitHub repository URL.");
  }

  if (url.hostname.toLowerCase() !== "github.com") {
    throw new Error("Only github.com repository URLs are supported.");
  }

  const [owner, repoWithSuffix] = url.pathname.split("/").filter(Boolean);
  if (!owner || !repoWithSuffix) {
    throw new Error("Use a full repo URL like https://github.com/owner/repo.");
  }

  const repo = repoWithSuffix.replace(/\.git$/i, "");
  return validateParts(owner, repo);
}

function validateParts(owner: string, repo: string): ParsedRepoUrl {
  if (!OWNER_PATTERN.test(owner) || !REPO_PATTERN.test(repo)) {
    throw new Error("The GitHub owner or repo name is invalid.");
  }

  return { owner, repo };
}
