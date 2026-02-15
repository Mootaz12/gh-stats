#!/usr/bin/env node

import { Command } from 'commander';
import { GitHubService } from './services/github/github.service.js';
import { OutputFormatter } from './services/output-formatter/output-formatter.service.js';
import { AuthService } from './services/auth/auth.service.js';

interface CliOptions {
  user?: string;
  commits?: boolean;
  prs?: boolean;
  repos?: boolean;
  from?: string;
  to?: string;
  format?: string;
}

async function main() {
  const program = new Command();

  program
    .name('agent-gh')
    .description(
      'GitHub Agent CLI - Fetch GitHub data and display it in text format',
    )
    .version('1.0.0')
    .option('--user <username>', 'GitHub username to query')
    .option('--commits', 'Fetch commits')
    .option('--prs', 'Fetch pull requests')
    .option('--repos', 'Fetch repositories')
    .option('--from <YYYY-MM-DD>', 'Start date for commits/PRs')
    .option('--to <YYYY-MM-DD>', 'End date for commits/PRs')
    .option('--format <text>', 'Output format; only text is supported', 'text')
    .parse(process.argv);

  const options = program.opts<CliOptions>();

  // Validate format
  if (options.format && options.format !== 'text') {
    console.error('Error: Only "text" format is currently supported.');
    process.exit(1);
  }

  // Validate user
  if (!options.user) {
    console.error('Error: --user <username> is required.');
    console.log('\nUsage: agent-gh --user <username> [options]');
    console.log('\nRun "agent-gh --help" for more information.');
    process.exit(1);
  }

  const username = options.user; // Store for type safety

  // Validate date format if provided
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (options.from && !dateRegex.test(options.from)) {
    console.error('Error: --from must be in YYYY-MM-DD format.');
    process.exit(1);
  }
  if (options.to && !dateRegex.test(options.to)) {
    console.error('Error: --to must be in YYYY-MM-DD format.');
    process.exit(1);
  }

  try {
    // Initialize services
    const authService = new AuthService();
    const token = await authService.getToken();
    const githubService = new GitHubService(token);
    const formatter = new OutputFormatter();

    // Determine what to fetch (default: all)
    const fetchAll = !options.commits && !options.prs && !options.repos;
    const shouldFetchCommits = fetchAll || options.commits;
    const shouldFetchPrs = fetchAll || options.prs;
    const shouldFetchRepos = fetchAll || options.repos;

    // Fetch user profile
    console.log('Fetching GitHub data...\n');
    const userProfile = await githubService.getUserProfile(username);

    // Display user profile
    formatter.printUserProfile(userProfile);

    // Fetch repositories if needed
    if (shouldFetchRepos || shouldFetchPrs || shouldFetchCommits) {
      const repos = await githubService.getUserRepositories(username);

      // Case 1: Only commits (no PRs) - fetch all repository commits
      if (shouldFetchCommits && !shouldFetchPrs && !shouldFetchRepos) {
        for (const repo of repos) {
          const commits = await githubService.getRepositoryCommits({
            owner: username,
            repo: repo.name,
            author: username, // Filter by the user
            fromDate: options.from,
            toDate: options.to,
          });

          if (commits.length > 0) {
            formatter.printRepositorySection(repo.name);
            formatter.printCommits(commits);
          }
        }
      }
      // Case 2: PRs with or without commits
      else if (shouldFetchPrs) {
        // Fetch PRs and optionally their commits
        for (const repo of repos) {
          const prs = await githubService.getRepositoryPullRequests({
            owner: username,
            repo: repo.name,
            fromDate: options.from,
            toDate: options.to,
          });

          if (prs.length > 0) {
            formatter.printRepositorySection(repo.name);

            for (const pr of prs) {
              const commits = shouldFetchCommits
                ? await githubService.getPullRequestCommits({
                    owner: username,
                    repo: repo.name,
                    pullNumber: pr.number,
                  })
                : [];

              formatter.printPullRequest(pr, commits);
            }
          }
        }

        // Print summary
        const totalPrs = repos.reduce(async (acc, repo) => {
          const prs = await githubService.getRepositoryPullRequests({
            owner: username,
            repo: repo.name,
            fromDate: options.from,
            toDate: options.to,
          });
          return (await acc) + prs.length;
        }, Promise.resolve(0));

        formatter.printSummary(await totalPrs);
      }
      // Case 3: Just repositories
      else if (shouldFetchRepos) {
        formatter.printRepositories(repos);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
    } else {
      console.error('\nAn unexpected error occurred.');
    }
    process.exit(1);
  }
}

main();
