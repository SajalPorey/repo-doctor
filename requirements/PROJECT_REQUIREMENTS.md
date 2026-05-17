# RepoDoctor Project Requirements

RepoDoctor is a GitHub repository health checker and upgrade assistant. The MVP lets a user paste a public GitHub repository URL, scans it with the GitHub REST API, and shows a health report with score, category breakdown, passed checks, failed checks, and actionable suggestions.

## Project Goal

Build a premium developer tool that helps developers improve their GitHub repositories by checking documentation, security, CI/CD, testing, code quality, and repository hygiene.

## Tech Stack

- Next.js 14 with App Router
- TypeScript with strict mode
- Tailwind CSS
- Octokit for GitHub REST API
- Zod for validation
- No database for MVP
- Optional GitHub token through environment variables

## Required Dependencies

Runtime dependencies:

- `next`
- `react`
- `react-dom`
- `@octokit/rest`
- `zod`

Development dependencies:

- `typescript`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `eslint`
- `eslint-config-next`
- `@types/node`
- `@types/react`
- `@types/react-dom`

## Environment Variables

Create `.env.local` in the project root when needed:

```bash
GITHUB_TOKEN=your_github_token_here
```

`GITHUB_TOKEN` is optional. Without it, GitHub allows only lower unauthenticated API limits. With it, the app can scan more repositories before hitting rate limits.

## MVP Features

- Public GitHub repo URL input
- Client-side URL validation
- Server-side scan API
- GitHub repository metadata fetch
- GitHub file tree scan
- README content scan
- package.json content scan
- Total health score from 0 to 100
- Category score breakdown
- Passed checks list
- Failed checks list
- Suggestions for failed checks
- Loading skeleton while scanning
- Friendly error messages
- Fully responsive dark UI

## API Route

Required route:

```text
GET /api/scan?repo=https://github.com/owner/repo-name
```

Required response fields:

- `repoName`
- `owner`
- `description`
- `stars`
- `forks`
- `language`
- `totalScore`
- `categories`
- `checks`
- `suggestion`

## GitHub API Endpoints

Use Octokit with these endpoints:

- `GET /repos/{owner}/{repo}` for metadata
- `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` for full file tree
- `GET /repos/{owner}/{repo}/contents/{path}` for README and package.json content

Only fetch file contents for:

- `README.md`
- `package.json`

All other checks should use file paths from the Git tree.

## Scoring System

Total score: `100`

| Category | Points |
| --- | ---: |
| Documentation | 20 |
| Security | 20 |
| CI/CD | 15 |
| Testing | 15 |
| Code Quality | 20 |
| Repo Hygiene | 10 |

## Documentation Checks

Total: `20`

- `README.md` exists: `+5`
- README has install steps with keywords `install`, `npm`, `yarn`, `pip`: `+4`
- README has usage guidance with keywords `usage`, `example`, `how to use`: `+3`
- `LICENSE` file exists: `+4`
- `CONTRIBUTING.md` exists: `+4`

## Security Checks

Total: `20`

- `.env` file is not committed: `+6`
- `.env.example` exists: `+4`
- README has no obvious secrets such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`: `+5`
- Dependency lockfile exists: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, or `requirements.txt`: `+5`

## CI/CD Checks

Total: `15`

- `.github/workflows/` directory exists: `+8`
- Workflow files exist inside it with `.yml` or `.yaml`: `+7`

## Testing Checks

Total: `15`

- Test folder exists: `tests/`, `__tests__`, or `test/`: `+5`
- Test files exist: `*.test.ts`, `*.spec.ts`, `*.test.js`, or `*.spec.js`: `+5`
- Test script exists in `package.json`: `+5`

## Code Quality Checks

Total: `20`

- `package.json` exists: `+5`
- ESLint config exists: `+5`
- Prettier config exists: `+5`
- `tsconfig.json` exists: `+5`

## Repo Hygiene Checks

Total: `10`

- `.gitignore` exists: `+5`
- `src/` folder exists: `+3`
- No unnecessary system files such as `.DS_Store` or `Thumbs.db`: `+2`

## Required Folder Structure

```text
repodoctor/
  app/
    page.tsx
    report/
      page.tsx
    api/
      scan/
        route.ts
  components/
    RepoUrlForm.tsx
    ScoreCard.tsx
    CategoryScore.tsx
    CheckList.tsx
    SuggestionCard.tsx
    ReportDashboard.tsx
  lib/
    github.ts
    parseRepoUrl.ts
    score.ts
    scanners/
      documentation.ts
      security.ts
      cicd.ts
      testing.ts
      codeQuality.ts
      hygiene.ts
  types/
    scan.ts
  requirements/
    PROJECT_REQUIREMENTS.md
```

## UI Requirements

Home page:

- Centered dark layout
- Headline: `Is your GitHub repo production-ready?`
- Subtext: `Paste any public repo URL and get an instant health report.`
- Large repo URL input
- Prominent `Scan Repo` button
- Three clickable example repo chips
- Loading skeleton while scanning

Report page:

- Repo information card
- Large circular health score
- Category progress bars
- Passed checks column
- Failed checks column
- Suggestions section for failed checks
- `Scan another repo` button

Design style:

- Dark background
- Zinc cards and borders
- Violet accent buttons
- Emerald pass states
- Red fail states
- Amber medium-score state
- Monospace repo names and file paths
- Responsive mobile and desktop layout

## Error Handling Requirements

- Invalid URL should show inline error
- Private repo should show friendly message
- Missing repo should return 404-style message
- Rate limit should show retry guidance
- Network error should show retry button

## GitHub Repository Setup Checklist

When pushing this project to GitHub, keep these files:

- `README.md`
- `.gitignore`
- `.env.local.example`
- `requirements/PROJECT_REQUIREMENTS.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.mjs`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.eslintrc.json`
- `app/`
- `components/`
- `lib/`
- `types/`

Do not commit:

- `node_modules/`
- `.next/`
- `.env.local`
- real GitHub tokens
- logs

## Local Setup Commands

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Production build check:

```bash
npm run build
```

## Future Upgrade Ideas

- GitHub OAuth login
- Private repository scanning
- AI README improvement generator
- Auto-generate `.gitignore`
- Auto-generate GitHub Actions workflow
- Create pull requests with recommended fixes
- Save scan history with database
- Export PDF health reports
- Compare two repositories
- Add badge generator for repo health score

## MVP Definition Of Done

The MVP is complete when:

- User can paste a public GitHub repo URL
- App scans metadata and file tree from GitHub
- App calculates score out of 100
- App shows all category scores
- App lists passed and failed checks
- App shows suggestions for failed checks
- Invalid and failed scans show friendly errors
- `npm run build` passes
