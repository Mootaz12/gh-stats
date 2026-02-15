import { BaseError } from '@/common/base-errors/base-error';

export class GitHubError extends BaseError {
  constructor(message: string) {
    super(message, 'GitHubError');
  }
}

/**
 * Thrown when a GitHub user is not found
 */
export class UserNotFoundError extends GitHubError {
  constructor(username: string) {
    super(`User "${username}" not found on GitHub.`);
  }
}

/**
 * Thrown when a repository is not found or not accessible
 */
export class RepositoryNotFoundError extends GitHubError {
  constructor(owner: string, repo: string) {
    super(`Repository "${owner}/${repo}" not found or not accessible.`);
  }
}

/**
 * Thrown when GitHub API rate limit is exceeded
 */
export class RateLimitError extends GitHubError {
  constructor() {
    super(
      'GitHub API rate limit exceeded. Please authenticate or wait before retrying.',
    );
  }
}
