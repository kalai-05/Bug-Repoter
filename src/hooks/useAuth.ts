import { useState, useEffect, useCallback } from 'react';
import { AuthError } from '../types/auth.types';
import type { GoogleUser } from '../types/auth.types';
import { authService } from '../services/auth/auth.service';
import { getStorageItem } from '../utils/storage.utils';

export interface UseAuthReturn {
  user: GoogleUser | null;
  /** True only during the initial mount check (load from storage + verify token). */
  isLoading: boolean;
  /** True while a login or logout action is in flight. */
  isAuthenticating: boolean;
  error: AuthError | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  /** Get a live access token for API calls (silently refreshed by Chrome). */
  getAccessToken: () => Promise<string | null>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await getStorageItem('googleUser');
        if (storedUser) {
          const isValid = await authService.checkAuthStatus();
          if (isValid) {
            setUser(storedUser);
          } else {
            // Token was revoked externally — clear stale user data
            await authService.logout().catch(() => {});
          }
        }
      } catch {
        // Non-fatal: treat as unauthenticated
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  const login = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const loggedInUser = await authService.login();
      setUser(loggedInUser);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('UNKNOWN', 'Login failed'));
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await authService.logout();
    } catch {
      // Best-effort — clear UI state regardless
    } finally {
      setUser(null);
      setIsAuthenticating(false);
    }
  }, []);

  const getAccessToken = useCallback(() => authService.getTokenSilent(), []);

  const clearError = useCallback(() => setError(null), []);

  return { user, isLoading, isAuthenticating, error, login, logout, getAccessToken, clearError };
}
