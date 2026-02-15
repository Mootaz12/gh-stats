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
    this.logAuthToConsole({
      type: 'log',
      msg: 'Checking for GITHUB_TOKEN environment variable...',
    });
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      this.logAuthToConsole({
        type: 'log',
        msg: 'Using GITHUB_TOKEN environment variable for authentication\n',
      });
      return githubToken;
    }
    this.logAuthToConsole({
      type: 'warn',
      msg: 'GITHUB_TOKEN environment variable not found',
    });
    this.logAuthToConsole({
      type: 'log',
      msg: 'Checking for gh CLI authentication...',
    });
    // Check for gh CLI
    try {
      // First, check if gh CLI is installed
      execSync('gh --version', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // gh is installed, ask for permission to use it
      this.logAuthToConsole({
        type: 'log',
        msg: 'GitHub CLI (gh) is installed',
      });
      this.logAuthToConsole({
        type: 'log',
        msg: 'Would you like to use gh CLI credentials for authentication?',
      });
      this.logAuthToConsole({
        type: 'log',
        msg: 'This will use your existing gh authentication.',
      });

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
          this.logAuthToConsole({
            type: 'log',
            msg: 'Using gh CLI credentials for authentication\n',
          });
          return ghToken;
        }
      } else {
        this.logAuthToConsole({
          type: 'log',
          msg: 'Skipping gh CLI authentication\n',
        });
      }
    } catch (error) {
      // gh CLI not installed or not authenticated
    }

    // Fall back to unauthenticated
    this.logAuthToConsole({
      type: 'warn',
      msg: 'No authentication found. Using unauthenticated requests.',
    });
    this.logAuthToConsole({
      type: 'warn',
      msg: 'Rate limit: 60 requests/hour (vs 5000 with authentication)',
    });
    this.logAuthToConsole({
      type: 'warn',
      msg: `To authenticate, either:
    - Set GITHUB_TOKEN environment variable
    - Install and authenticate with gh CLI (gh auth login)\n`,
    });

    return null;
  }
  logAuthToConsole({
    type = 'log',
    msg,
  }: {
    type?: 'log' | 'warn';
    msg: string;
  }) {
    console[type](`[AUTH] ${msg}`);
  }
}
