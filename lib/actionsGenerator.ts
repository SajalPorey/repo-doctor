import type { TechStack } from "@/lib/detector";

export interface GeneratedWorkflow {
  filename: string;
  label: string;
  description: string;
  yaml: string;
}

export function generateWorkflows(stack: TechStack, defaultBranch: string, hasTests: boolean = true): GeneratedWorkflow[] {
  const branch = defaultBranch || "main";

  switch (stack) {
    case "typescript":
    case "javascript":
      return generateJsWorkflows(stack, branch, hasTests);
    case "python":
      return generatePythonWorkflows(branch, hasTests);
    case "rust":
      return generateRustWorkflows(branch, hasTests);
    case "go":
      return generateGoWorkflows(branch, hasTests);
    case "java":
      return generateJavaWorkflows(branch, hasTests);
    default:
      return generateGenericWorkflow(branch, hasTests);
  }
}

// ── JavaScript / TypeScript ───────────────────────────────────────────────────
function generateJsWorkflows(stack: TechStack, branch: string, hasTests: boolean): GeneratedWorkflow[] {
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
        run: npm install
${isTs ? `
      - name: Type check
        run: if [ -f tsconfig.json ]; then npx tsc --noEmit; fi
` : ""}
      - name: Lint
        run: npm run lint --if-present || true

      - name: Build
        run: npm run build --if-present
${hasTests ? `
      - name: Test
        run: npm test --if-present` : `
      # - name: Test
      #   run: npm test`}
`
    }
  ];
}

// ── Python ────────────────────────────────────────────────────────────────────
function generatePythonWorkflows(branch: string, hasTests: boolean): GeneratedWorkflow[] {
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
${hasTests ? `
      - name: Run tests
        run: pytest --tb=short -v` : `
      # - name: Run tests
      #   run: pytest --tb=short -v`}
`
    }
  ];
}

// ── Rust ──────────────────────────────────────────────────────────────────────
function generateRustWorkflows(branch: string, hasTests: boolean): GeneratedWorkflow[] {
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
${hasTests ? `
      - name: Run tests
        run: cargo test --all-features` : `
      # - name: Run tests
      #   run: cargo test --all-features`}

      - name: Check (no build artifacts)
        run: cargo check --all-targets
`
    }
  ];
}

// ── Go ────────────────────────────────────────────────────────────────────────
function generateGoWorkflows(branch: string, hasTests: boolean): GeneratedWorkflow[] {
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
        uses: golangci/golangci-lint-action@v3
        with:
          version: latest
${hasTests ? `
      - name: Run tests
        run: go test -v -race ./...` : `
      # - name: Run tests
      #   run: go test -v -race ./...`}

      - name: Build
        run: go build ./...
`
    }
  ];
}

// ── Java ──────────────────────────────────────────────────────────────────────
function generateJavaWorkflows(branch: string, hasTests: boolean): GeneratedWorkflow[] {
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

      - name: Build with Maven
        run: mvn -B package --file pom.xml
${hasTests ? `
      - name: Run tests
        run: mvn test` : `
      # - name: Run tests
      #   run: mvn test`}
`
    }
  ];
}

// ── Generic / Unknown ─────────────────────────────────────────────────────────
function generateGenericWorkflow(branch: string, hasTests: boolean): GeneratedWorkflow[] {
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
