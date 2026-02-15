import { Injectable } from '@nestjs/common';
import {
  UserProfile,
  Repository,
  PullRequest,
  Commit,
} from '@app-types/github.types';

@Injectable()
export class OutputFormatter {
  /**
   * Print user profile information
   */
  printUserProfile(profile: UserProfile): void {
    console.log(`GitHub User: ${profile.login}`);
    console.log(`Name: ${profile.name || 'N/A'}`);
    console.log(`Public Repos: ${this.formatNumber(profile.publicRepos)}`);
    console.log(`Followers: ${this.formatNumber(profile.followers)}`);
    console.log(`Following: ${this.formatNumber(profile.following)}`);
    console.log(`Profile: ${profile.profileUrl}`);
    console.log();
  }

  /**
   * Print repository section header
   */
  printRepositorySection(repoName: string): void {
    console.log('----------------------------------------');
    console.log(`Repository: ${repoName}`);
    console.log('----------------------------------------');
  }

  /**
   * Print a pull request with its commits
   */
  printPullRequest(pr: PullRequest, commits: Commit[]): void {
    const date = this.formatDate(pr.createdAt);
    const state = pr.state === 'open' ? 'Open' : 'Closed';

    console.log(`${state} Pull Requests:`);
    console.log(
      `#${pr.number} ${this.truncate(pr.title, 30).padEnd(30)} ` +
        `Author: ${pr.author.padEnd(12)} Created: ${date}`,
    );

    if (commits.length > 0) {
      console.log('    Commits:');
      for (const commit of commits) {
        console.log(
          `    - ${commit.sha} ${this.truncate(commit.message, 40).padEnd(40)} ` +
            `Author: ${commit.author}`,
        );
      }
    }
    console.log();
  }

  /**
   * Print list of repositories
   */
  printRepositories(repos: Repository[]): void {
    console.log('----------------------------------------');
    console.log('Repositories:');
    console.log('----------------------------------------');

    for (const repo of repos) {
      console.log(`${repo.name}`);
      if (repo.description) {
        console.log(`  ${repo.description}`);
      }
      console.log(
        `  ⭐ ${repo.stars} | 🍴 ${repo.forks}${repo.isPrivate ? ' | 🔒 Private' : ''}`,
      );
      console.log();
    }
  }

  /**
   * Print summary statistics
   */
  printSummary(totalPrs: number, totalCommits?: number): void {
    console.log('----------------------------------------');
    console.log('Summary:');
    console.log(`Total PRs: ${totalPrs}`);
    if (totalCommits !== undefined) {
      console.log(`Total commits in PRs: ${totalCommits}`);
    }
    console.log('----------------------------------------');
  }

  /**
   * Format a date string to YYYY-MM-DD
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  /**
   * Format large numbers with k suffix
   */
  private formatNumber(num: number): string {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }

  /**
   * Truncate string to max length
   */
  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - 3) + '...';
  }
}
