# 🩺 RepoDoctor

> **Instant GitHub repository health checks — right inside GitHub.**

RepoDoctor is a Chrome Extension that automatically appears as a sidebar whenever you visit any GitHub repository. It scans the repo and gives you a health score across key categories like Documentation, Security, CI/CD, Testing, Code Quality, and Repo Hygiene — without leaving the page.

---

## ✨ Features

- **Auto-sidebar on GitHub** — Opens automatically on any `github.com/owner/repo` page
- **Instant health scoring** — 100-point model across 6 categories
- **21 automated checks** — README, license, CI/CD, security policy, test setup, and more
- **Upgrade suggestions** — Actionable fixes for every failed check
- **GitHub PAT support** — Save your Personal Access Token locally to avoid rate limits
- **Zero backend** — Runs entirely in your browser, no server required

---

## 📸 How It Works

1. You open any GitHub repo
2. RepoDoctor sidebar slides in from the right
3. It scans the repo via the GitHub API
4. You get a full health report with scores and suggestions

Use the **🩺 purple tab** on the right edge to toggle the sidebar open/closed anytime.

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
# This creates the `out/` folder — your extension bundle
```

Then load into Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `out/` folder inside this project
5. Visit any GitHub repo and watch the sidebar appear!

---

## ⚡ GitHub API Rate Limits

Unauthenticated requests to the GitHub API are limited to **60 requests/hour**. To increase this:

1. Click the **⚙️ Settings** icon in the RepoDoctor sidebar header
2. Paste your [GitHub Personal Access Token](https://github.com/settings/tokens) (no scopes needed for public repos)
3. Click **Save** — your token is stored locally in `localStorage`, never sent anywhere else

---

## 🏗 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (Static Export) |
| Language | TypeScript |
| GitHub API | Octokit REST |
| Styling | Tailwind CSS |
| Extension | Chrome MV3 (Content Script + Popup) |
| Build | Custom post-build script (`rename-next.js`) |

---

## 📁 Project Structure

```
repodoctor/
├── app/
│   ├── page.tsx              # Main popup/sidebar UI
│   └── layout.tsx
├── components/
│   ├── ReportDashboard.tsx   # Full scan results UI
│   ├── RepoUrlForm.tsx       # URL input form
│   ├── ScoreCard.tsx         # Overall score display
│   ├── CategoryScore.tsx     # Per-category breakdown
│   └── SuggestionCard.tsx    # Upgrade suggestions
├── hooks/
│   └── useRepoScanner.ts     # Client-side GitHub scan logic
├── lib/
│   ├── github.ts             # Octokit wrapper (browser-compatible)
│   ├── score.ts              # Score aggregation
│   └── scanners/             # Per-category check logic
├── public/
│   ├── content.js            # Content script → injects sidebar on GitHub
│   └── manifest.json         # Chrome Extension manifest (MV3)
├── rename-next.js            # Post-build: renames _next/, extracts inline scripts
└── out/                      # Built extension (gitignored)
```

---

## 🔭 Roadmap

- [ ] Repo type detection (library vs app vs research vs CLI)
- [ ] Stack-aware checks (Python, Rust, Go specific)
- [ ] Maturity-calibrated scoring (age + stars + contributors)
- [ ] Chrome Web Store publish
- [ ] Dark/light sidebar theme toggle
- [ ] Scan history across repos

---

## 📄 License

MIT © [Sajal Porey](https://github.com/SajalPorey)
