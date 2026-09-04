'use client';

/**
 * Legacy hook — prefer `@/contexts/AuthContext`.
 * Kept for AuthForm and other older callers; stores the same JWT keys.
 */
import { useState, useCallback } from 'react';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  email: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const identifier = credentials.username.trim();
      const body = identifier.includes('@')
        ? { email: identifier.toLowerCase(), password: credentials.password }
        : { email: identifier, password: credentials.password };

      // Prefer email; if username was given without @, try as email first then legacy login
      let response = await fetch(`${apiUrl}/api/auth/v2/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok && !identifier.includes('@')) {
        response = await fetch(`${apiUrl}/api/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password: credentials.password }),
        });
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.detail || 'Login failed');
      }

      const data = await response.json();
      const access = data.access_token || data.access;
      const refresh = data.refresh_token || data.refresh;
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/auth/v2/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          username: userData.username,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.detail || 'Registration failed');
      }

      const responseData = await response.json();
      localStorage.setItem('access_token', responseData.access_token);
      localStorage.setItem('refresh_token', responseData.refresh_token);
      if (responseData.user) localStorage.setItem('user', JSON.stringify(responseData.user));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refresh = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
    if (!refresh) return false;

    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }, [apiUrl]);

  const getUser = useCallback(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('token'));
  }, []);

  return { login, register, logout, refreshToken, getUser, isAuthenticated, loading, error };
}
