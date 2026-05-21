import type { PackageJson, RiskItem } from "@/types/scan";

interface OsvQuery {
  package: {
    name: string;
    ecosystem: string;
  };
  version: string;
}

interface OsvBatchResponse {
  results: {
    vulns?: {
      id: string;
      summary?: string;
      details?: string;
      aliases?: string[];
    }[];
  }[];
}

function cleanVersion(version: string): string {
  // Remove ^, ~, >, <, =, and whitespace
  const cleaned = version.replace(/^[^0-9]+/, "").trim();
  return cleaned || version;
}

export async function fetchOsvVulnerabilities(packageJson: PackageJson): Promise<RiskItem[]> {
  try {
    const dependencies: Record<string, string> = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };

    const pkgNames = Object.keys(dependencies);
    if (pkgNames.length === 0) {
      return [];
    }

    // Limit to avoid massive payloads on huge repos (e.g., take first 100)
    const MAX_PACKAGES = 100;
    const queries: OsvQuery[] = pkgNames.slice(0, MAX_PACKAGES).map((name) => ({
      package: { name, ecosystem: "npm" },
      version: cleanVersion(dependencies[name])
    }));

    const response = await fetch("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ queries })
    });

    if (!response.ok) {
      console.error("OSV API Error:", response.statusText);
      return [];
    }

    const data = (await response.json()) as OsvBatchResponse;
    const risks: RiskItem[] = [];

    data.results.forEach((result, index) => {
      if (result.vulns && result.vulns.length > 0) {
        const query = queries[index];
        const vuln = result.vulns[0]; // Take the most prominent one
        
        risks.push({
          id: `osv-${query.package.name}-${vuln.id}`,
          severity: "high",
          title: `Vulnerable Dependency: ${query.package.name} (${query.version})`,
          description: `Found known vulnerability ${vuln.id}${vuln.summary ? `: ${vuln.summary}` : ""}. Using vulnerable dependencies can lead to serious security breaches.`,
          fix: `Update \`${query.package.name}\` to a secure version. Run \`npm audit fix\` or update manually in package.json.`
        });
      }
    });

    return risks;
  } catch (err) {
    console.error("Failed to fetch OSV vulnerabilities:", err);
    return [];
  }
}
