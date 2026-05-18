import { scanCiCd } from "@/lib/scanners/cicd";
import { scanCodeQuality } from "@/lib/scanners/codeQuality";
import { scanDocumentation } from "@/lib/scanners/documentation";
import { scanHygiene } from "@/lib/scanners/hygiene";
import { scanSecurity } from "@/lib/scanners/security";
import { scanTesting } from "@/lib/scanners/testing";
import { scanRisks } from "@/lib/scanners/risks";
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

  const totalScore = maxWeightedScore > 0
    ? Math.round((weightedScore / maxWeightedScore) * 100)
    : 0;

  return { totalScore, maxPossibleScore: 100 };
}

export function buildScanResult(
  metadata: GitHubRepoMetadata,
  context: ScanContext
): ScanResponse {
  // 1. Detect repo context (type, stack, maturity)
  const repoContext = buildRepoContext(
    context.paths,
    metadata.stars,
    metadata.forks,
    metadata.createdAt,
    context.packageJson
  );

  // 2. Enrich ScanContext with detected tech stack for stack-aware scanners
  const enrichedContext: ScanContext = { ...context, techStack: repoContext.techStack };

  // 3. Run all scanners with enriched context
  const categories = [
    scanDocumentation(enrichedContext),
    scanSecurity(enrichedContext),
    scanCiCd(enrichedContext),
    scanTesting(enrichedContext),
    scanCodeQuality(enrichedContext),
    scanHygiene(enrichedContext)
  ];

  // 4. Apply repo-type-aware weight multipliers
  const weights = CATEGORY_WEIGHTS[repoContext.repoType];
  const { totalScore, maxPossibleScore } = calculateWeightedScore(categories, weights);

  // 5. Detect repo risks
  const risks = scanRisks(enrichedContext);

  // 6. Check for CONTRIBUTING.md
  const hasContributing = context.paths.some(
    (p) => p.toLowerCase() === "contributing.md" || p.toLowerCase() === ".github/contributing.md"
  );

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
    context: repoContext,
    risks,
    hasContributing,
    defaultBranch: metadata.defaultBranch
  };
}
