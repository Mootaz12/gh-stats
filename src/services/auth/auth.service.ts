import { execSync } from 'child_process';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor() {}

  /**
   * Detects and returns an authentication token
   * Priority:
   * 1. GITHUB_TOKEN environment variable
   * 2. gh CLI authentication
   * 3. null (unauthenticated, with warning)
   * @returns detected  token or null
   */
  async getToken(): Promise<string | null> {
    // Check for GITHUB_TOKEN
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      this.logger.log(
        '✓ Using GITHUB_TOKEN environment variable for authentication\n',
      );
      return githubToken;
    }

    // Check for gh CLI
    try {
      const ghToken = execSync('gh auth token', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      if (ghToken) {
        this.logger.log('✓ Using gh CLI credentials for authentication\n');
        return ghToken;
      }
    } catch (error) {
      // gh CLI not installed or not authenticated
    }

    // Fall back to unauthenticated
    this.logger.warn(
      '⚠ Warning: No authentication found. Using unauthenticated requests.',
    );
    this.logger.warn(
      '  Rate limit: 60 requests/hour (vs 5000 with authentication)',
    );
    this.logger.warn('  To authenticate, either:');
    this.logger.warn('    - Set GITHUB_TOKEN environment variable');
    this.logger.warn(
      '    - Install and authenticate with gh CLI (gh auth login)\n',
    );

    return null;
  }
}
