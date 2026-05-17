# RepoDoctor

RepoDoctor is a GitHub repository health checker and upgrade assistant. Paste a public GitHub repository URL and get a scored report for documentation, security, CI/CD, testing, code quality, and repository hygiene.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Octokit
- Zod

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Optional GitHub Token

Create `.env.local` and add a token to increase GitHub API rate limits:

```bash
GITHUB_TOKEN=your_token_here
```

The app works without a token for public repositories, but unauthenticated GitHub API calls are rate-limited.
