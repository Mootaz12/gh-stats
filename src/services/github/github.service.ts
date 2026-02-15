import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';
import {
  UserProfile,
  Repository,
  PullRequest,
  Commit,
} from '@app-types/github.types';
import {
  UserNotFoundError,
  GitHubError,
  RateLimitError,
} from '@errors/github.errors';

@Injectable()
export class GitHubService {
  private octokit: Octokit;

  constructor(token: string | null) {
    this.octokit = new Octokit({ auth: token || undefined });
  }

  /**
   * Fetch user profile information
   */
  async getUserProfile(username: string): Promise<UserProfile> {
    try {
      const { data } = await this.octokit.rest.users.getByUsername({
        username,
      });

      return {
        login: data.login,
        name: data.name,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        profileUrl: data.html_url,
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new UserNotFoundError(username);
      }
      if (error.status === 403) {
        throw new RateLimitError();
      }
      throw new GitHubError(`Failed to fetch user profile: ${error.message}`);
    }
  }

  /**
   * Fetch all repositories for a user (with pagination)
   */
  async getUserRepositories(username: string): Promise<Repository[]> {
    const repos: Repository[] = [];
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        const { data } = await this.octokit.rest.repos.listForUser({
          username,
          per_page: perPage,
          page,
          sort: 'updated',
          direction: 'desc',
        });

        if (data.length === 0) break;

        repos.push(
          ...data.map((repo) => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            isPrivate: repo.private,
          })),
        );

        if (data.length < perPage) break;
        page++;
      }

      return repos;
    } catch (error: any) {
      if (error.status === 403) {
        throw new RateLimitError();
      }
      throw new GitHubError(`Failed to fetch repositories: ${error.message}`);
    }
  }

  /**
   * Fetch pull requests for a repository (with optional date filtering)
   */
  async getRepositoryPullRequests(
    owner: string,
    repo: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<PullRequest[]> {
    const prs: PullRequest[] = [];
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        const { data } = await this.octokit.rest.pulls.list({
          owner,
          repo,
          state: 'all',
          per_page: perPage,
          page,
          sort: 'created',
          direction: 'desc',
        });

        if (data.length === 0) break;

        for (const pr of data) {
          const createdAt = new Date(pr.created_at);

          // Apply date filters
          if (fromDate && createdAt < new Date(fromDate)) continue;
          if (toDate && createdAt > new Date(toDate)) continue;

          prs.push({
            number: pr.number,
            title: pr.title,
            author: pr.user?.login || 'unknown',
            createdAt: pr.created_at,
            state: pr.state,
            url: pr.html_url,
          });
        }

        if (data.length < perPage) break;
        page++;
      }

      return prs;
    } catch (error: any) {
      // Repository might not exist or be accessible
      return [];
    }
  }

  /**
   * Fetch commits for a specific pull request
   */
  async getPullRequestCommits(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<Commit[]> {
    const commits: Commit[] = [];
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        const { data } = await this.octokit.rest.pulls.listCommits({
          owner,
          repo,
          pull_number: pullNumber,
          per_page: perPage,
          page,
        });

        if (data.length === 0) break;

        commits.push(
          ...data.map((commit) => ({
            sha: commit.sha.substring(0, 7),
            message: commit.commit.message.split('\n')[0], // First line only
            author: commit.commit.author?.name || 'unknown',
            date: commit.commit.author?.date || '',
          })),
        );

        if (data.length < perPage) break;
        page++;
      }

      return commits;
    } catch (error: any) {
      return [];
    }
  }
}
