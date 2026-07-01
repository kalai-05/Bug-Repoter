export interface GoogleUser {
  /** Google's stable unique user ID */
  sub: string;
  name: string;
  email: string;
  /** HTTPS URL to the user's profile picture */
  picture: string;
}

export type AuthErrorCode =
  | 'AUTH_CANCELLED'
  | 'NOT_SIGNED_IN_TO_CHROME'
  | 'TOKEN_REVOKED'
  | 'USER_INFO_FAILED'
  | 'UNKNOWN';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  get userMessage(): string {
    switch (this.code) {
      case 'AUTH_CANCELLED':
        return 'Sign-in was cancelled.';
      case 'NOT_SIGNED_IN_TO_CHROME':
        return 'Please sign into Chrome before connecting your Google account.';
      case 'TOKEN_REVOKED':
        return 'Your Google access was revoked. Please sign in again.';
      case 'USER_INFO_FAILED':
        return 'Could not retrieve your Google profile. Check your connection and try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
