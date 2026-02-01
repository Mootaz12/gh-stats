# GitHub Stats CLI

A powerful command-line tool built with NestJS and TypeScript to fetch and display GitHub user statistics, repositories, pull requests, and commits in a clean text format.

## 📋 Description

GitHub Stats CLI (`agent-gh`) is a developer-friendly tool that provides comprehensive insights into GitHub user activity. It supports flexible querying with date filtering, authentication via GitHub tokens or GitHub CLI, and presents data in an organized, readable text format.

## Features

- 📊 **User Profile Information** - Display user stats including repos, followers, and following
- 📦 **Repository Listing** - View all repositories with stars, forks, and privacy status
- 🔀 **Pull Request Tracking** - Fetch PRs with optional date filtering
- 💻 **Commit History** - View commits associated with pull requests
- 🔐 **Flexible Authentication** - Supports GITHUB_TOKEN env var or GitHub CLI
- 📅 **Date Filtering** - Filter PRs and commits by date range
- 🎯 **Selective Fetching** - Choose what data to fetch (repos, PRs, commits, or all)

## 🏗️ Architecture

The project follows clean architecture principles with:

- **Single Responsibility Services** - Each service has a focused purpose
- **Dedicated Type Definitions** - Centralized types in `src/types/`
- **Custom Error Handling** - Service-specific errors in `src/errors/`

### Project Structure

```
src/
├── types/
│   └── github.types.ts          # Type definitions (UserProfile, Repository, etc.)
├── errors/
│   ├── auth.errors.ts           # Authentication error classes
│   └── github.errors.ts         # GitHub API error classes
├── services/
│   ├── auth/
│   │   └── auth.service.ts      # Authentication detection (returns token)
│   ├── github/
│   │   └── github.service.ts    # GitHub API interactions
│   └── output-formatter/
│       └── output-formatter.service.ts  # Output formatting
└── cli.ts                       # CLI entry point
```

## 🚀 Installation

```bash
# Install dependencies
npm install

# Build the CLI
npm run build:cli
```

## 🔧 Usage

### Basic Commands

```bash
# Fetch all data for a user
npm run cli -- --user octocat

# Fetch only repositories
npm run cli -- --user octocat --repos

# Fetch only pull requests
npm run cli -- --user octocat --prs

# Fetch PRs with commits
npm run cli -- --user octocat --prs --commits

# Fetch with date filtering
npm run cli -- --user octocat --prs --from 2024-01-01 --to 2024-12-31
```

### CLI Options

| Option                | Description                         | Example             |
| --------------------- | ----------------------------------- | ------------------- |
| `--user <username>`   | GitHub username to query (required) | `--user octocat`    |
| `--repos`             | Fetch repositories only             | `--repos`           |
| `--prs`               | Fetch pull requests only            | `--prs`             |
| `--commits`           | Fetch commits (with PRs)            | `--commits`         |
| `--from <YYYY-MM-DD>` | Start date for filtering            | `--from 2024-01-01` |
| `--to <YYYY-MM-DD>`   | End date for filtering              | `--to 2024-12-31`   |
| `--format <text>`     | Output format (only text supported) | `--format text`     |

### Authentication

The CLI supports multiple authentication methods (checked in order):

1. **GITHUB_TOKEN environment variable**

   ```bash
   export GITHUB_TOKEN="your_github_token"
   npm run cli -- --user octocat
   ```

2. **GitHub CLI (gh)**

   ```bash
   gh auth login
   npm run cli -- --user octocat
   ```

3. **Unauthenticated** (limited to 60 requests/hour)
   ```bash
   npm run cli -- --user octocat
   ```

> **Note:** Authenticated requests have a rate limit of 5,000 requests/hour vs 60 for unauthenticated.

## 🛠️ Development

### 📦 Technologies

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Octokit](https://github.com/octokit/octokit.js)** - GitHub REST API client
- **[Commander.js](https://github.com/tj/commander.js)** - CLI framework

## 🎯 Example Output

```

✓ Using GITHUB_TOKEN environment variable for authentication

Fetching GitHub data...

GitHub User: octocat
Name: The Octocat
Public Repos: 8
Followers: 4.2k
Following: 9
Profile: https://github.com/octocat

---

## Repository: Hello-World

Open Pull Requests:
#42 Add new feature Author: octocat Created: 2024-06-15
Commits: - a1b2c3d Initial implementation Author: The Octocat - d4e5f6g Add tests Author: The Octocat

---

Summary:
Total PRs: 5
Total commits in PRs: 12

```
