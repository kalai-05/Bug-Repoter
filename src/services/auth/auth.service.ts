import { AuthError } from '../../types/auth.types';
import type { GoogleUser } from '../../types/auth.types';
import { setStorageItem, removeStorageItem } from '../../utils/storage.utils';

const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

class AuthService {
  private getToken(interactive: boolean): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError || !token) {
          resolve(null);
          return;
        }
        resolve(token);
      });
    });
  }

  /**
   * Silently acquire a token using Chrome's cached identity.
   * Returns null if the user has never authenticated or the token was revoked.
   * Chrome automatically refreshes expired tokens when possible.
   */
  async getTokenSilent(): Promise<string | null> {
    return this.getToken(false);
  }

  /**
   * Acquire a token, showing the Google consent screen if needed.
   * Throws AuthError when the user cancels or Chrome is not signed in.
   */
  async getTokenInteractive(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(this.mapChromeError(chrome.runtime.lastError.message ?? ''));
          return;
        }
        if (!token) {
          reject(new AuthError('AUTH_CANCELLED', 'No token returned'));
          return;
        }
        resolve(token);
      });
    });
  }

  async fetchUserInfo(token: string): Promise<GoogleUser> {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new AuthError('USER_INFO_FAILED', `Failed to fetch user info: ${res.status}`);
    }

    const data = await res.json() as Record<string, unknown>;

    if (typeof data['sub'] !== 'string' || typeof data['email'] !== 'string') {
      throw new AuthError('USER_INFO_FAILED', 'Invalid user info response from Google');
    }

    return {
      sub: data['sub'],
      name: typeof data['name'] === 'string' ? data['name'] : data['email'],
      email: data['email'],
      picture: typeof data['picture'] === 'string' ? data['picture'] : '',
    };
  }

  /** Full login flow: show consent → fetch profile → persist user (not the token). */
  async login(): Promise<GoogleUser> {
    const token = await this.getTokenInteractive();
    const user = await this.fetchUserInfo(token);
    await setStorageItem('googleUser', user);
    return user;
  }

  /**
   * Sign out: revoke token on Google's servers (best-effort), remove from
   * Chrome's local token cache, and clear the stored user profile.
   */
  async logout(): Promise<void> {
    const token = await this.getTokenSilent();

    if (token) {
      // Fire-and-forget revocation — don't block logout on a network failure
      fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' }).catch(() => {});

      await new Promise<void>((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, resolve);
      });
    }

    await removeStorageItem('googleUser');
  }

  /** Returns true if Chrome has a valid (or refreshable) token for this extension. */
  async checkAuthStatus(): Promise<boolean> {
    const token = await this.getTokenSilent();
    return token !== null;
  }

  private mapChromeError(message: string): AuthError {
    const lower = message.toLowerCase();
    if (lower.includes('not approved') || lower.includes('did not approve') || lower.includes('cancel')) {
      return new AuthError('AUTH_CANCELLED', message);
    }
    if (lower.includes('not signed in') || lower.includes('not authenticated')) {
      return new AuthError('NOT_SIGNED_IN_TO_CHROME', message);
    }
    if (lower.includes('revoked') || lower.includes('not granted')) {
      return new AuthError('TOKEN_REVOKED', message);
    }
    return new AuthError('UNKNOWN', message);
  }
}

export const authService = new AuthService();
