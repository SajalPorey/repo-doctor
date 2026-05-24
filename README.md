# 🩺 RepoDoctor

> **Instant GitHub repository health checks — right inside GitHub.**

RepoDoctor is a Chrome Extension that automatically appears as a sidebar whenever you visit any GitHub repository. It scans the repo and gives you a health score, risk warnings, and a step-by-step contribute guide — without leaving the page.

---

## ✨ Features

- **Auto-sidebar on GitHub** — Slides in on any `github.com/owner/repo` page automatically
- **Context-aware health scoring** — Weighted 100-point model that adapts to the repo type
- **Repo type detection** — Identifies Library, Web App, CLI Tool, Research, Monorepo, or Docs repos
- **Stack-aware checks** — Python, Rust, Go, TypeScript, and JavaScript specific checks
- **Maturity-calibrated scoring** — Adjusts expectations based on age, stars, and forks
- **🔴 Risk Warnings** — Detects dangerous patterns (committed `.env`, missing `.gitignore`, DB migrations on main, lockfile conflicts, and more)
- **🔒 Dependency Vulnerability Scan (OSV)** — Batch queries the open OSV.dev database to flag known security vulnerabilities in your `package.json` dependencies with score deduction penalties
- **📘 Contribute Guide** — Auto-generated step-by-step git workflow with copy-able, repo-specific commands
- **🛠️ Actions Generator** — 1-click CI/CD workflow generator based on repo's tech stack (TypeScript, Python, Rust, Go, etc.)
- **Scan History** — Remembers your last 20 scanned repos locally for quick re-checks
- **Modification Time** — See exactly when the repository was last updated alongside key metrics
- **Upgrade suggestions** — Actionable fix for every failed check
- **GitHub PAT support** — Save your token locally to avoid API rate limits
- **Zero backend** — Runs entirely in your browser, no server required

---

## 🚀 Usage & How It Works

1. Open any GitHub repository
2. The **RepoDoctor sidebar** slides in from the right
3. It scans the repo via the GitHub API
4. You get a full health report with:
   - Overall score + context badges (repo type, stack, maturity)
   - 🔴 Risk Warnings above the score
   - Category breakdown with weighted scores
   - Passed / Failed checks
   - Actionable upgrade suggestions
5. Switch to the **📘 Contribute tab** for a step-by-step git guide to contribute to the repo
6. Switch to the **🛠️ Actions tab** to generate a stack-specific GitHub Actions CI workflow

Use the **🩺 purple toggle tab** on the right edge to open/close the sidebar anytime.

---

## 🛠 Installation (Developer Mode)

> Chrome Web Store listing coming soon. For now, load it manually.

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/SajalPorey/repo-doctor.git
cd repo-doctor

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
# Creates the `out/` folder — your extension bundle

# 4. Bundle into a zip file (optional)
npm run bundle
# Or run build + bundle in one go:
npm run build:ext
# Creates `repodoctor-extension.zip` in the root directory
```

Then load into Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `out/` folder inside this project (or unzip the bundled extension and load it)
5. Visit any GitHub repo — the sidebar will appear automatically!

---

## ⚡ GitHub API Rate Limits

Unauthenticated requests to the GitHub API are limited to **60 requests/hour**. To increase this:

1. Click the **⚙️ Settings** icon in the RepoDoctor sidebar
2. Paste your [GitHub Personal Access Token](https://github.com/settings/tokens) (no extra scopes needed for public repos)
3. Click **Save** — token is stored in `localStorage`, never sent anywhere

---

## 🧠 Intelligence

### Repo Type Detection
RepoDoctor classifies every repo into one of:
`library` · `web-app` · `cli-tool` · `research` · `monorepo` · `docs-only` · `unknown`

Each type gets **different scoring weights** — e.g. documentation counts more for libraries, CI/CD counts more for web apps.

### Stack-Aware Checks
Checks are tailored to the detected stack:

| Stack | Testing Checks | Code Quality Checks |
|---|---|---|
| 🐍 Python | `pytest.ini`, `test_*.py` | `pyproject.toml`, `ruff`, `mypy` |
| 🦀 Rust | `tests/*.rs`, `benches/` | `rustfmt.toml`, `deny.toml`, `clippy` |
| 🐹 Go | `*_test.go`, `testify` | `.golangci.yml`, `Makefile` |
| 🟦 TypeScript | `vitest/jest config`, coverage | `ESLint`, `Prettier`, `tsconfig.json` |

### Maturity Calibration
Scoring expectations adjust based on repo age and stars:
- 🌱 **Hobby** — Young or small repo; lenient expectations
- 📈 **Growing** — Gaining traction; moderate expectations
- 🚀 **Production** — Established repo; full expectations

### Risk Warnings
Detects structural risks from the file tree:

| Severity | Risk |
|---|---|
| 🔴 High | `.env` file committed |
| 🔴 High | No `.gitignore` |
| 🔴 High | DB migrations folder present |
| 🔴 High | Multiple lockfiles (npm + yarn + pnpm) |
| 🟡 Medium | No CI/CD pipeline |
| 🟡 Medium | Binary files tracked in git |
| 🟡 Medium | No tests — merges are unverified |
| 🔵 Info | No `CHANGELOG.md` |
| 🔵 Info | No issue templates |

---

## 🏗 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (Static Export) |
| Language | TypeScript |
| GitHub API | Octokit REST |
| Styling | Tailwind CSS |
| Extension | Chrome MV3 (Content Script) |
| Build | Custom post-build script (`rename-next.js`) |

---

## 📁 Project Structure

```
repodoctor/
├── app/
│   ├── page.tsx                  # Main sidebar UI + tab switcher
│   └── layout.tsx
├── components/
│   ├── ReportDashboard.tsx       # Full scan results with tabs
│   ├── RiskWarnings.tsx          # 🔴 Risk warning cards
│   ├── ContributeGuide.tsx       # 📘 Step-by-step contribute guide
│   ├── ActionsGenerator.tsx      # 🛠️ Actions workflow generator
│   ├── ScanHistory.tsx           # Scan history list
│   ├── RepoUrlForm.tsx           # URL input form
│   ├── ScoreCard.tsx             # Overall score display
│   ├── CategoryScore.tsx         # Per-category breakdown
│   └── SuggestionCard.tsx        # Upgrade suggestions
├── hooks/
│   ├── useRepoScanner.ts         # Client-side GitHub scan orchestration
│   └── useScanHistory.ts         # LocalStorage history hook
├── lib/
│   ├── github.ts                 # Octokit wrapper (browser-compatible)
│   ├── detector.ts               # Repo type, stack & maturity detection
│   ├── score.ts                  # Weighted score aggregation
│   ├── osv.ts                    # npm dependency vulnerability checker (OSV API)
│   ├── actionsGenerator.ts       # CI/CD workflow template generation
│   └── scanners/
│       ├── cicd.ts               # CI/CD checks
│       ├── codeQuality.ts        # Code quality checks (stack-aware)
│       ├── documentation.ts      # Documentation checks
│       ├── hygiene.ts            # Repo hygiene checks
│       ├── risks.ts              # 🔴 Structural risk detection
│       ├── security.ts           # Security checks
│       ├── stackChecks.ts        # Per-stack check modules
│       └── testing.ts            # Testing checks (stack-aware)
├── public/
│   ├── content.js                # Injects sidebar on GitHub pages
│   └── manifest.json             # Chrome Extension manifest (MV3)
├── scripts/
│   └── bundle-extension.js       # Node script to package out/ folder into a zip
├── tests/
│   └── example.test.ts           # Unit tests setup (Vitest)
├── rename-next.js                # Post-build: renames _next/, extracts scripts for CSP
└── out/                          # Built extension (load this into Chrome)
```

---

## 🔭 Roadmap

- [x] Repo type detection (library vs app vs research vs CLI)
- [x] Stack-aware checks (Python, Rust, Go, TypeScript)
- [x] Maturity-calibrated scoring (age + stars)
- [x] Repo Risk Warnings (`.env`, migrations, lockfile conflicts, etc.)
- [x] Contribute Guide (step-by-step git workflow)
- [x] Actions Generator (1-click stack-specific CI/CD YAML)
- [x] Scan history across repos (LocalStorage)
- [ ] Dark/light sidebar theme toggle
- [ ] Chrome Web Store publish

---

## 📄 License

MIT © [Sajal Porey](https://github.com/SajalPorey)
