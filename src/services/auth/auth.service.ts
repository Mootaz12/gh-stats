import { execSync } from 'child_process';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
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
    console.log('[AUTH] Checking for GITHUB_TOKEN environment variable...');
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      console.log(
        '[AUTH] Using GITHUB_TOKEN environment variable for authentication\n',
      );
      return githubToken;
    }
    console.log('[AUTH] GITHUB_TOKEN environment variable not found');
    console.log('[AUTH] Checking for gh CLI authentication...');
    // Check for gh CLI
    try {
      // First, check if gh CLI is installed
      execSync('gh --version', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // gh is installed, ask for permission to use it
      console.log('[AUTH] GitHub CLI (gh) is installed');
      console.log(
        '[AUTH] Would you like to use gh CLI credentials for authentication?',
      );
      console.log('[AUTH] This will use your existing gh authentication.');

      // Simple prompt using readline
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const useGhCli = await new Promise<boolean>((resolve) => {
        readline.question('  Use gh CLI? (y/n): ', (answer: string) => {
          readline.close();
          resolve(
            answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes',
          );
        });
      });

      if (useGhCli) {
        const ghToken = execSync('gh auth token', {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();

        if (ghToken) {
          console.log('[AUTH] Using gh CLI credentials for authentication\n');
          return ghToken;
        }
      } else {
        console.log('[AUTH] Skipping gh CLI authentication\n');
      }
    } catch (error) {
      // gh CLI not installed or not authenticated
    }

    // Fall back to unauthenticated
    console.warn(
      '[AUTH] ⚠ Warning: No authentication found. Using unauthenticated requests.',
    );
    console.warn(
      '[AUTH] Rate limit: 60 requests/hour (vs 5000 with authentication)',
    );
    console.warn(`[AUTH] To authenticate, either:
    - Set GITHUB_TOKEN environment variable
    - Install and authenticate with gh CLI (gh auth login)\n`);

    return null;
  }
}
