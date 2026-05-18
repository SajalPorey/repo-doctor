import type { TechStack } from "@/lib/detector";

export interface GeneratedWorkflow {
  filename: string;
  label: string;
  description: string;
  yaml: string;
}

export function generateWorkflows(stack: TechStack, defaultBranch: string): GeneratedWorkflow[] {
  const branch = defaultBranch || "main";

  switch (stack) {
    case "typescript":
    case "javascript":
      return generateJsWorkflows(stack, branch);
    case "python":
      return generatePythonWorkflows(branch);
    case "rust":
      return generateRustWorkflows(branch);
    case "go":
      return generateGoWorkflows(branch);
    case "java":
      return generateJavaWorkflows(branch);
    default:
      return generateGenericWorkflow(branch);
  }
}

// ── JavaScript / TypeScript ───────────────────────────────────────────────────
function generateJsWorkflows(stack: TechStack, branch: string): GeneratedWorkflow[] {
  const isTs = stack === "typescript";
  return [
    {
      filename: "ci.yml",
      label: `${isTs ? "TypeScript" : "JavaScript"} CI`,
      description: "Lint, type-check, test, and build on every push and PR",
      yaml: `name: CI

on:
  push:
    branches: [ "${branch}" ]
  pull_request:
    branches: [ "${branch}" ]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
${isTs ? `
      - name: Type check
        run: npx tsc --noEmit
` : ""}
      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
`
    }
  ];
}

// ── Python ────────────────────────────────────────────────────────────────────
function generatePythonWorkflows(branch: string): GeneratedWorkflow[] {
  return [
    {
      filename: "ci.yml",
      label: "Python CI",
      description: "Lint with ruff, type-check with mypy, test with pytest",
      yaml: `name: CI

on:
  push:
    branches: [ "${branch}" ]
  pull_request:
    branches: [ "${branch}" ]

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
          # Or: pip install -r requirements-dev.txt

      - name: Lint with ruff
        run: ruff check .

      - name: Format check
        run: ruff format --check .

      - name: Type check with mypy
        run: mypy .

      - name: Run tests
        run: pytest --tb=short -v
`
    }
  ];
}

// ── Rust ──────────────────────────────────────────────────────────────────────
function generateRustWorkflows(branch: string): GeneratedWorkflow[] {
  return [
    {
      filename: "ci.yml",
      label: "Rust CI",
      description: "Format check, Clippy lint, test, and optional deny audit",
      yaml: `name: CI

on:
  push:
    branches: [ "${branch}" ]
  pull_request:
    branches: [ "${branch}" ]

env:
  CARGO_TERM_COLOR: always
  RUSTFLAGS: "-Dwarnings"

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - name: Cache cargo
        uses: Swatinem/rust-cache@v2

      - name: Check formatting
        run: cargo fmt --all -- --check

      - name: Clippy
        run: cargo clippy --all-targets --all-features -- -D warnings

      - name: Run tests
        run: cargo test --all-features

      - name: Check (no build artifacts)
        run: cargo check --all-targets
`
    }
  ];
}

// ── Go ────────────────────────────────────────────────────────────────────────
function generateGoWorkflows(branch: string): GeneratedWorkflow[] {
  return [
    {
      filename: "ci.yml",
      label: "Go CI",
      description: "Vet, golangci-lint, and test with race detection",
      yaml: `name: CI

on:
  push:
    branches: [ "${branch}" ]
  pull_request:
    branches: [ "${branch}" ]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache: true

      - name: Vet
        run: go vet ./...

      - name: golangci-lint
        uses: golangci/golangci-lint-action@v6
        with:
          version: latest

      - name: Test with race detection
        run: go test -race -coverprofile=coverage.out ./...

      - name: Build
        run: go build ./...
`
    }
  ];
}

// ── Java ──────────────────────────────────────────────────────────────────────
function generateJavaWorkflows(branch: string): GeneratedWorkflow[] {
  return [
    {
      filename: "ci.yml",
      label: "Java CI (Maven)",
      description: "Build and test with Maven",
      yaml: `name: CI

on:
  push:
    branches: [ "${branch}" ]
  pull_request:
    branches: [ "${branch}" ]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build and Test
        run: mvn --batch-mode --update-snapshots verify
`
    }
  ];
}

// ── Generic ───────────────────────────────────────────────────────────────────
function generateGenericWorkflow(branch: string): GeneratedWorkflow[] {
  return [
    {
      filename: "ci.yml",
      label: "Basic CI",
      description: "Minimal CI template — customize for your stack",
      yaml: `name: CI

on:
  push:
    branches: [ "${branch}" ]
  pull_request:
    branches: [ "${branch}" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Add your build and test steps here
      - name: Run checks
        run: echo "Add your lint, test, build commands here"
`
    }
  ];
}
