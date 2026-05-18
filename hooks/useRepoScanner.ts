import { useState } from "react";
import {
  fetchFileContent,
  fetchRepoMetadata,
  fetchRepoTree,
  isGitHubApiError
} from "@/lib/github";
import { buildScanResult } from "@/lib/score";
import { addScanToHistory } from "@/hooks/useScanHistory";
import type { ScanResponse, PackageJson } from "@/types/scan";

export function useRepoScanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const scanRepo = async (owner: string, repo: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Fetch metadata
      const metadata = await fetchRepoMetadata(owner, repo);

      // 2. Fetch file tree
      const tree = await fetchRepoTree(owner, repo, metadata.defaultBranch);
      const paths = tree.map((item) => item.path);

      // 3. Fetch specific files if they exist
      let readme = "";
      if (paths.some((p) => p.toLowerCase() === "readme.md")) {
        const readmePath = tree.find((item) => item.path.toLowerCase() === "readme.md")?.path || "README.md";
        readme = await fetchFileContent(owner, repo, readmePath, metadata.defaultBranch);
      }

      let packageJsonContent: PackageJson | undefined;
      if (paths.includes("package.json")) {
        const content = await fetchFileContent(owner, repo, "package.json", metadata.defaultBranch);
        if (content) {
          try {
            packageJsonContent = JSON.parse(content) as PackageJson;
          } catch (e) {
            console.error("Failed to parse package.json", e);
          }
        }
      }

      // 4. Build score and result
      const scanResult = buildScanResult(metadata, {
        paths,
        readmeContent: readme,
        packageJson: packageJsonContent || null,
        techStack: "other" // detected & overridden by buildScanResult via detector
      });

      setResult(scanResult);

      // 5. Add to history
      addScanToHistory({
        owner: scanResult.owner,
        repoName: scanResult.repoName,
        score: scanResult.totalScore,
        language: scanResult.language,
        repoType: scanResult.context.repoType
      });
    } catch (err: unknown) {
      console.error(err);
      if (isGitHubApiError(err)) {
        if (err.status === 404) {
          setError("Repository not found. It might be private or spelled incorrectly.");
        } else if (err.status === 403 && err.response?.headers?.["x-ratelimit-remaining"] === "0") {
          setError("GitHub API rate limit exceeded. Please try again later.");
        } else {
          setError(`GitHub API Error: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred while scanning the repository.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { scanRepo, loading, error, result };
}
