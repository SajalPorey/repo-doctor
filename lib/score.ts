import { scanCiCd } from "@/lib/scanners/cicd";
import { scanCodeQuality } from "@/lib/scanners/codeQuality";
import { scanDocumentation } from "@/lib/scanners/documentation";
import { scanHygiene } from "@/lib/scanners/hygiene";
import { scanSecurity } from "@/lib/scanners/security";
import { scanTesting } from "@/lib/scanners/testing";
import { buildRepoContext, CATEGORY_WEIGHTS } from "@/lib/detector";
import type { GitHubRepoMetadata } from "@/lib/github";
import type { CategoryResult, ScanContext, ScanResponse } from "@/types/scan";

export function calculateWeightedScore(
  categories: CategoryResult[],
  weights: Record<string, number>
): { totalScore: number; maxPossibleScore: number } {
  let weightedScore = 0;
  let maxWeightedScore = 0;

  for (const category of categories) {
    const w = weights[category.name] ?? 1.0;
    weightedScore += category.score * w;
    maxWeightedScore += category.maxScore * w;
  }

  // Normalize back to 0–100 scale
  const totalScore = maxWeightedScore > 0
    ? Math.round((weightedScore / maxWeightedScore) * 100)
    : 0;

  return { totalScore, maxPossibleScore: 100 };
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

  const repoContext = buildRepoContext(
    context.paths,
    metadata.stars,
    metadata.forks,
    metadata.createdAt,
    context.packageJson
  );

  const weights = CATEGORY_WEIGHTS[repoContext.repoType];
  const { totalScore, maxPossibleScore } = calculateWeightedScore(categories, weights);

  return {
    repoName: metadata.repoName,
    owner: metadata.owner,
    description: metadata.description,
    stars: metadata.stars,
    forks: metadata.forks,
    language: metadata.language,
    totalScore,
    maxPossibleScore,
    categories,
    context: repoContext
  };
}
