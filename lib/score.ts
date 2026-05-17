import { scanCiCd } from "@/lib/scanners/cicd";
import { scanCodeQuality } from "@/lib/scanners/codeQuality";
import { scanDocumentation } from "@/lib/scanners/documentation";
import { scanHygiene } from "@/lib/scanners/hygiene";
import { scanSecurity } from "@/lib/scanners/security";
import { scanTesting } from "@/lib/scanners/testing";
import type { GitHubRepoMetadata } from "@/lib/github";
import type { CategoryResult, ScanContext, ScanResponse } from "@/types/scan";

export function calculateTotalScore(categories: CategoryResult[]): number {
  return categories.reduce((total, category) => total + category.score, 0);
}

export function buildScanResult(
  metadata: GitHubRepoMetadata,
  context: ScanContext
): ScanResponse {
  const categories = [
    scanDocumentation(context),
    scanSecurity(context),
    scanCiCd(context),
    scanTesting(context),
    scanCodeQuality(context),
    scanHygiene(context)
  ];

  return {
    repoName: metadata.repoName,
    owner: metadata.owner,
    description: metadata.description,
    stars: metadata.stars,
    forks: metadata.forks,
    language: metadata.language,
    totalScore: calculateTotalScore(categories),
    categories
  };
}
