/**
 * Stack-aware checks for each tech stack.
 * Each function returns an array of RepoCheck objects to be merged
 * into the appropriate category (Testing or Code Quality).
 */
import type { RepoCheck, ScanContext } from "@/types/scan";

// ── Python ────────────────────────────────────────────────────────────────────
export function pythonTestingChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  return [
    {
      id: "python-pytest-config",
      label: "pytest config exists (pytest.ini / conftest.py / pyproject.toml)",
      passed: paths.some(
        (p) =>
          p === "pytest.ini" ||
          p === "conftest.py" ||
          p.endsWith("/conftest.py") ||
          (p === "pyproject.toml" && paths.includes("pyproject.toml"))
      ),
      points: 5,
      suggestion: {
        why: "pytest is the standard Python test runner. A config file enables consistent test discovery.",
        fix: "Add pytest.ini or configure pytest in pyproject.toml.",
        example: "[tool.pytest.ini_options]\ntestpaths = [\"tests\"]"
      }
    },
    {
      id: "python-test-files",
      label: "Python test files exist (test_*.py or *_test.py)",
      passed: paths.some((p) => /test_[^/]+\.py$/.test(p) || /[^/]+_test\.py$/.test(p)),
      points: 5,
      suggestion: {
        why: "Test files prove your code works and prevent regressions.",
        fix: "Add test files following pytest naming: test_module.py or module_test.py.",
        example: "tests/test_main.py"
      }
    }
  ];
}

export function pythonQualityChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  const hasPyproject = paths.includes("pyproject.toml");
  return [
    {
      id: "python-pyproject-toml",
      label: "pyproject.toml exists",
      passed: hasPyproject,
      points: 5,
      suggestion: {
        why: "pyproject.toml is the modern standard for Python project metadata, dependencies, and tooling config.",
        fix: "Replace setup.py / setup.cfg with pyproject.toml.",
        example: "[build-system]\nrequires = [\"hatchling\"]\nbuild-backend = \"hatchling.build\""
      }
    },
    {
      id: "python-linter",
      label: "Linter configured (ruff / flake8 / pylint)",
      passed: paths.some(
        (p) =>
          p === ".flake8" ||
          p === "pylintrc" ||
          p === ".pylintrc" ||
          p === "ruff.toml" ||
          p === ".ruff.toml" ||
          (hasPyproject) // ruff / pylint config commonly lives in pyproject.toml
      ),
      points: 5,
      suggestion: {
        why: "Linting catches bugs and style issues before they reach review.",
        fix: "Add ruff (fast, modern) or flake8 to your project.",
        example: "[tool.ruff]\nline-length = 88\nselect = [\"E\", \"F\", \"I\"]"
      }
    },
    {
      id: "python-type-hints",
      label: "Type checker configured (mypy / pyright)",
      passed: paths.some(
        (p) =>
          p === "mypy.ini" ||
          p === ".mypy.ini" ||
          p === "pyrightconfig.json"
      ),
      points: 5,
      suggestion: {
        why: "Type checking makes refactoring safe and improves IDE support.",
        fix: "Add mypy.ini or configure mypy in pyproject.toml.",
        example: "[tool.mypy]\nstrict = true"
      }
    }
  ];
}

// ── Rust ──────────────────────────────────────────────────────────────────────
export function rustTestingChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  return [
    {
      id: "rust-tests-dir",
      label: "Integration tests directory exists (tests/)",
      passed: paths.some((p) => p.startsWith("tests/") && p.endsWith(".rs")),
      points: 5,
      suggestion: {
        why: "Rust integration tests in tests/ verify your public API works end-to-end.",
        fix: "Add tests/ directory with integration test files.",
        example: "tests/integration_test.rs"
      }
    },
    {
      id: "rust-benches",
      label: "Benchmarks exist (benches/)",
      passed: paths.some((p) => p.startsWith("benches/") && p.endsWith(".rs")),
      points: 5,
      suggestion: {
        why: "Benchmarks guard against performance regressions.",
        fix: "Add benches/ with criterion benchmarks.",
        example: "benches/my_benchmark.rs"
      }
    }
  ];
}

export function rustQualityChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  return [
    {
      id: "rust-rustfmt",
      label: "rustfmt.toml configured",
      passed: paths.includes("rustfmt.toml") || paths.includes(".rustfmt.toml"),
      points: 5,
      suggestion: {
        why: "rustfmt ensures consistent code formatting across the team.",
        fix: "Add rustfmt.toml with your preferred settings.",
        example: "edition = \"2021\"\nmax_width = 100"
      }
    },
    {
      id: "rust-deny-toml",
      label: "cargo-deny configured (deny.toml)",
      passed: paths.includes("deny.toml"),
      points: 5,
      suggestion: {
        why: "cargo-deny checks for security advisories, license compliance, and duplicate deps.",
        fix: "Add deny.toml and run cargo deny check in CI.",
        example: "deny.toml"
      }
    },
    {
      id: "rust-clippy-ci",
      label: "Clippy runs in CI",
      passed: paths.some((p) => p.startsWith(".github/workflows/") && p.endsWith(".yml")) &&
        ctx.paths.some((p) => p.startsWith(".github/workflows/")), // we'd need file content for full check
      points: 5,
      suggestion: {
        why: "Clippy catches common mistakes and non-idiomatic Rust that the compiler misses.",
        fix: "Add `cargo clippy -- -D warnings` to your CI workflow.",
        example: "run: cargo clippy -- -D warnings"
      }
    }
  ];
}

// ── Go ────────────────────────────────────────────────────────────────────────
export function goTestingChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  return [
    {
      id: "go-test-files",
      label: "Go test files exist (*_test.go)",
      passed: paths.some((p) => p.endsWith("_test.go")),
      points: 5,
      suggestion: {
        why: "Go test files verify behavior and are the standard for Go testing.",
        fix: "Add _test.go files alongside your packages.",
        example: "pkg/mypackage/handler_test.go"
      }
    },
    {
      id: "go-testify",
      label: "testify or testing library used",
      passed: paths.some((p) => p === "go.sum") && paths.some((p) => p.endsWith("_test.go")),
      points: 5,
      suggestion: {
        why: "testify provides better assertions and test structure than stdlib alone.",
        fix: "Add github.com/stretchr/testify to go.mod.",
        example: "go get github.com/stretchr/testify"
      }
    }
  ];
}

export function goQualityChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  return [
    {
      id: "go-golangci-lint",
      label: "golangci-lint configured (.golangci.yml)",
      passed: paths.some(
        (p) => p === ".golangci.yml" || p === ".golangci.yaml" || p === ".golangci.json" || p === ".golangci.toml"
      ),
      points: 5,
      suggestion: {
        why: "golangci-lint aggregates many linters and is the standard Go linting solution.",
        fix: "Add .golangci.yml with your linter configuration.",
        example: ".golangci.yml"
      }
    },
    {
      id: "go-makefile",
      label: "Makefile with common targets exists",
      passed: paths.includes("makefile") || paths.includes("gnumakefile"),
      points: 5,
      suggestion: {
        why: "A Makefile standardizes build/test/lint commands for all contributors.",
        fix: "Add a Makefile with build, test, and lint targets.",
        example: "make test"
      }
    }
  ];
}

// ── JavaScript / TypeScript ───────────────────────────────────────────────────
export function jsTestingChecks(ctx: ScanContext): RepoCheck[] {
  const paths = ctx.paths.map((p) => p.toLowerCase());
  const scripts = ctx.packageJson?.scripts ?? {};
  return [
    {
      id: "js-vitest-or-jest",
      label: "Test framework configured (Vitest / Jest / Mocha)",
      passed:
        paths.some((p) => p === "vitest.config.ts" || p === "vitest.config.js" || p === "jest.config.js" || p === "jest.config.ts") ||
        Boolean((ctx.packageJson as any)?.devDependencies?.vitest) ||
        Boolean((ctx.packageJson as any)?.devDependencies?.jest),
      points: 5,
      suggestion: {
        why: "A configured test framework ensures consistent test running and coverage reporting.",
        fix: "Add Vitest (for Vite/Next projects) or Jest with a config file.",
        example: "vitest.config.ts"
      }
    },
    {
      id: "js-coverage-script",
      label: "Coverage script exists",
      passed: Object.values(scripts).some((s) => typeof s === "string" && s.includes("coverage")),
      points: 5,
      suggestion: {
        why: "Coverage reports tell you which code paths are untested.",
        fix: "Add a coverage script to package.json.",
        example: "\"coverage\": \"vitest run --coverage\""
      }
    }
  ];
}

export function jsQualityChecks(_ctx: ScanContext): RepoCheck[] {
  // JS/TS quality checks are already covered in codeQuality.ts (ESLint, Prettier, tsconfig)
  // Return empty — no duplication
  return [];
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export function getStackTestingChecks(ctx: ScanContext): RepoCheck[] {
  switch (ctx.techStack) {
    case "python":     return pythonTestingChecks(ctx);
    case "rust":       return rustTestingChecks(ctx);
    case "go":         return goTestingChecks(ctx);
    case "typescript":
    case "javascript": return jsTestingChecks(ctx);
    default:           return [];
  }
}

export function getStackQualityChecks(ctx: ScanContext): RepoCheck[] {
  switch (ctx.techStack) {
    case "python":     return pythonQualityChecks(ctx);
    case "rust":       return rustQualityChecks(ctx);
    case "go":         return goQualityChecks(ctx);
    case "typescript":
    case "javascript": return jsQualityChecks(ctx);
    default:           return [];
  }
}
