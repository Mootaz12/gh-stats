import { BaseError } from '@/common/base-errors/base-error';

export class AuthenticationError extends BaseError {
  constructor(message: string) {
    super(message, 'AuthenticationError');
  }
}

export class NoAuthenticationFoundError extends AuthenticationError {
  constructor() {
    super(
      'No authentication found. Please set GITHUB_TOKEN or authenticate with gh CLI.',
    );
  }
}
