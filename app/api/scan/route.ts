import { NextResponse } from "next/server";
import { z } from "zod";

import {
  fetchFileContent,
  fetchRepoMetadata,
  fetchRepoTree,
  isGitHubApiError
} from "@/lib/github";
import { parseRepoUrl } from "@/lib/parseRepoUrl";
import { buildScanResult } from "@/lib/score";
import type { PackageJson, ScanErrorResponse } from "@/types/scan";

export const dynamic = "force-dynamic";

const scanQuerySchema = z.object({
  repo: z.string().min(1, "Repository URL is required.")
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = scanQuerySchema.safeParse({
    repo: searchParams.get("repo")
  });

  if (!query.success) {
    return errorResponse("invalid_url", "Paste a valid public GitHub repository URL.", 400);
  }

  let parsedRepo: { owner: string; repo: string };
  try {
    parsedRepo = parseRepoUrl(query.data.repo);
  } catch (error) {
    return errorResponse(
      "invalid_url",
      error instanceof Error ? error.message : "Paste a valid public GitHub repository URL.",
      400
    );
  }

  try {
    const metadata = await fetchRepoMetadata(parsedRepo.owner, parsedRepo.repo);

    if (metadata.private) {
      return errorResponse(
        "private_repo",
        "This repository is private. RepoDoctor MVP can scan public repositories only.",
        403
      );
    }

    const tree = await fetchRepoTree(parsedRepo.owner, parsedRepo.repo, metadata.defaultBranch);
    const paths = tree.map((item) => item.path);
    const readmePath = findRootFile(paths, ["README.md"]);
    const packagePath = findRootFile(paths, ["package.json"]);

    const [readmeContent, packageJsonContent] = await Promise.all([
      readmePath
        ? fetchFileContent(parsedRepo.owner, parsedRepo.repo, readmePath, metadata.defaultBranch)
        : Promise.resolve(""),
      packagePath
        ? fetchFileContent(parsedRepo.owner, parsedRepo.repo, packagePath, metadata.defaultBranch)
        : Promise.resolve("")
    ]);

    const packageJson = parsePackageJson(packageJsonContent);
    const result = buildScanResult(metadata, {
      paths,
      readmeContent,
      packageJson
    });

    return NextResponse.json(result);
  } catch (error) {
    if (isGitHubApiError(error)) {
      return handleGitHubError(error);
    }

    return errorResponse(
      "network_error",
      "Something went wrong while scanning this repo. Please try again.",
      500
    );
  }
}

function findRootFile(paths: string[], names: string[]): string | undefined {
  const lowerNames = names.map((name) => name.toLowerCase());
  return paths.find((path) => lowerNames.includes(path.toLowerCase()));
}

function parsePackageJson(content: string): PackageJson | null {
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as PackageJson;
  } catch {
    return null;
  }
}

function handleGitHubError(error: {
  status: number;
  message: string;
  response?: { headers?: Record<string, string | number | undefined> };
}) {
  const headers = error.response?.headers ?? {};
  const remaining = String(headers["x-ratelimit-remaining"] ?? "");
  const reset = headers["x-ratelimit-reset"];
  const retryAfter = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : undefined;

  if (error.status === 404) {
    return errorResponse(
      "repo_not_found",
      "Repository not found. Check the URL and make sure the repo is public.",
      404
    );
  }

  if (error.status === 403 && (remaining === "0" || /rate limit/i.test(error.message))) {
    return errorResponse(
      "rate_limited",
      retryAfter
        ? `GitHub API rate limit hit. Try again after ${retryAfter}.`
        : "GitHub API rate limit hit. Add GITHUB_TOKEN in .env.local or try again later.",
      429,
      retryAfter
    );
  }

  if (error.status === 403) {
    return errorResponse(
      "private_repo",
      "This repository cannot be accessed. RepoDoctor MVP can scan public repositories only.",
      403
    );
  }

  return errorResponse(
    "github_error",
    "GitHub returned an error while scanning this repo. Please try again.",
    error.status >= 400 && error.status < 600 ? error.status : 500
  );
}

function errorResponse(
  code: string,
  message: string,
  status: number,
  retryAfter?: string
) {
  const body: ScanErrorResponse = {
    error: {
      code,
      message,
      retryAfter
    }
  };

  return NextResponse.json(body, { status });
}
