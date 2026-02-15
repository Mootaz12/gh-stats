# GitHub Stats CLI

A powerful command-line tool built with NestJS and TypeScript to fetch and display GitHub user statistics, repositories, pull requests, and commits in a clean text format.

## 📋 Description

GitHub Stats CLI (`gh-stats`) is a developer-friendly tool that provides comprehensive insights into GitHub user activity. It supports flexible querying with date filtering, secure authentication with user consent, and presents data in an organized, readable text format.

### Features

- 📊 **User Profile Information** - Display user stats including repos, followers, and following
- 📦 **Repository Listing** - View all repositories with stars, forks, and privacy status
- 🔀 **Pull Request Tracking** - Fetch PRs with optional date filtering
- 💻 **Commit History** - Fetch ALL commits or only PR-associated commits
- 🔐 **Secure Authentication** - User consent required before using gh CLI credentials
- 📅 **Date Filtering** - Filter PRs and commits by date range
- 🎯 **Selective Fetching** - Choose what data to fetch (repos, PRs, commits, or all)
- 🏗️ **Clean Architecture** - Single responsibility services with typed parameters

## 🏗️ Architecture

The project follows clean architecture principles with:

- **Single Responsibility Services** - Each service has a focused purpose
- **Dedicated Type Definitions** - Centralized types in `src/types/` with parameter types
- **Custom Error Handling** - Service-specific errors in `src/errors/`
- **NestJS Patterns** - Injectable services with proper dependency injection
- **TypeScript Path Aliases** - Clean imports using `@errors/*`, `@app-types/*`, etc.

### Project Structure

```
src/
├── types/
│   └── github.types.ts          # Type definitions + parameter types
├── errors/
│   ├── auth.errors.ts           # Authentication error classes
│   └── github.errors.ts         # GitHub API error classes
├── services/
│   ├── auth/
│   │   └── auth.service.ts      # Authentication with user consent
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
# or
pnpm install

# Build the CLI
npm run build:cli
```

## 🔧 Usage

### Running the CLI

**Important:** Always build first, then run the compiled version:

```bash
# Build the CLI
npm run build:cli

# Run the CLI
node dist/cli.js --user <username> [options]
```

### Basic Commands

```bash
# Fetch all data for a user
node dist/cli.js --user octocat

# Fetch only repositories
node dist/cli.js --user octocat --repos

# Fetch only pull requests
node dist/cli.js --user octocat --prs

# Fetch ALL commits (not just PR commits)
node dist/cli.js --user octocat --commits

# Fetch PRs with their commits
node dist/cli.js --user octocat --prs --commits

# Fetch with date filtering
node dist/cli.js --user octocat --prs --from 2024-01-01 --to 2024-12-31

# Fetch commits from a specific date range
node dist/cli.js --user octocat --commits --from 2024-01-01 --to 2024-12-31
```

### CLI Options

| Option                | Description                         | Example             |
| --------------------- | ----------------------------------- | ------------------- |
| `--user <username>`   | GitHub username to query (required) | `--user octocat`    |
| `--repos`             | Fetch repositories only             | `--repos`           |
| `--prs`               | Fetch pull requests only            | `--prs`             |
| `--commits`           | Fetch commits (see behavior below)  | `--commits`         |
| `--from <YYYY-MM-DD>` | Start date for filtering            | `--from 2024-01-01` |
| `--to <YYYY-MM-DD>`   | End date for filtering              | `--to 2024-12-31`   |
| `--format <text>`     | Output format (only text supported) | `--format text`     |

### Commits Behavior

The `--commits` flag behaves differently depending on what else is specified:

- **`--commits` alone**: Fetches ALL commits from repositories (not just PR commits)
- **`--prs --commits` together**: Fetches only commits that are part of pull requests

This allows you to see all your work, even commits that aren't associated with PRs!

### Authentication

The CLI supports multiple authentication methods with **user consent**:

#### 1. GITHUB_TOKEN environment variable (Automatic)

```bash
export GITHUB_TOKEN="your_github_token"
node dist/cli.js --user octocat
```

Output:

```
✓ Using GITHUB_TOKEN environment variable for authentication
```

#### 2. GitHub CLI (gh) - Requires Permission

When gh CLI is detected, you'll be prompted:

```bash
node dist/cli.js --user octocat
```

Output:

```
✓ GitHub CLI (gh) is installed
  Would you like to use gh CLI credentials for authentication?
  This will use your existing gh authentication.
  Use gh CLI? (y/n):
```

Type `y` to approve or `n` to decline.

#### 3. Unauthenticated (Fallback)

If no authentication is available or you decline gh CLI:

```
⚠ Warning: No authentication found. Using unauthenticated requests.
  Rate limit: 60 requests/hour (vs 5000 with authentication)
  To authenticate, either:
    - Set GITHUB_TOKEN environment variable
    - Install and authenticate with gh CLI (gh auth login)
```

> **Note:** Authenticated requests have a rate limit of 5,000 requests/hour vs 60 for unauthenticated.

## 🛠️ Development

### Available Scripts

```bash
# Build the CLI (compiles TypeScript + resolves path aliases)
npm run build:cli

# Build NestJS application
npm run build

# Start NestJS in development mode
npm run dev
# or
npm run start:dev

# Format code
npm run format

# Lint code
npm run lint

```

### TypeScript Path Aliases

The project uses clean import paths for better maintainability:

```typescript
// Instead of: import { GitHubError } from '../../errors/github.errors'
import { GitHubError } from '@errors/github.errors';

// Instead of: import { UserProfile } from '../../types/github.types'
import { UserProfile } from '@app-types/github.types';
```

Available aliases:

- `@/*` - Maps to `src/*`
- `@services/*` - Maps to `src/services/*`
- `@errors/*` - Maps to `src/errors/*`
- `@app-types/*` - Maps to `src/types/*`
- `@common/*` - Maps to `src/common/*`

## 📦 Technologies

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Octokit](https://github.com/octokit/octokit.js)** - GitHub REST API client
- **[Commander.js](https://github.com/tj/commander.js)** - CLI framework
- **[tsc-alias](https://github.com/justkey007/tsc-alias)** - Path alias resolver

## 🎯 Example Output

### Fetching Repositories

```bash
node dist/cli.js --user octocat --repos
```

```
✓ Using GITHUB_TOKEN environment variable for authentication

Fetching GitHub data...

GitHub User: octocat
Name: The Octocat
Public Repos: 8
Followers: 21.8k
Following: 9
Profile: https://github.com/octocat

----------------------------------------
Repositories:
----------------------------------------
Hello-World
  My first repository on GitHub!
  ⭐ 3515 | 🍴 5827

Spoon-Knife
  This repo is for demonstration purposes only.
  ⭐ 13605 | 🍴 156182
```

### Fetching Pull Requests with Commits

```bash
node dist/cli.js --user octocat --prs --commits
```

```
✓ GitHub CLI (gh) is installed
  Would you like to use gh CLI credentials for authentication?
  This will use your existing gh authentication.
  Use gh CLI? (y/n): y
✓ Using gh CLI credentials for authentication

Fetching GitHub data...

GitHub User: octocat
Name: The Octocat
Public Repos: 8
Followers: 21.8k
Following: 9
Profile: https://github.com/octocat

----------------------------------------
Repository: Hello-World
----------------------------------------
Open Pull Requests:
#42 Add new feature                    Author: octocat      Created: 2024-06-15
    Commits:
    - a1b2c3d Initial implementation              Author: The Octocat
    - d4e5f6g Add tests                          Author: The Octocat

----------------------------------------
Summary:
Total PRs: 5
----------------------------------------
```

### Fetching All Commits

```bash
node dist/cli.js --user yourusername --commits --from 2024-01-01
```

```
----------------------------------------
Repository: my-project
----------------------------------------
Commits:
abc1234 Fix authentication bug                               Author: Your Name            Date: 2024-06-15
def5678 Add new feature                                      Author: Your Name            Date: 2024-06-14
```

## 🔒 Security Features

- **User Consent Required**: CLI asks for explicit permission before using gh CLI credentials
- **Transparent Authentication**: Clear messaging about which auth method is being used
- **No Silent Credential Usage**: All authentication is visible and approved by the user

## 🤝 Contributing

This is a private project. For questions or issues, please contact the maintainer.

## 📄 License

UNLICENSED - Private project

## 🔗 Related Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [NestJS Documentation](https://docs.nestjs.com)
- [Octokit Documentation](https://octokit.github.io/rest.js/)
