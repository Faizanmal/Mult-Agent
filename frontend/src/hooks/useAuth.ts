'use client';

import { useState, useCallback } from 'react';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  email: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store tokens in localStorage
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const responseData: AuthResponse = await response.json();
      
      // Store tokens
      localStorage.setItem('token', responseData.access);
      localStorage.setItem('refreshToken', responseData.refresh);
      
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) return false;

    try {
      const response = await fetch(`${apiUrl}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access);
      
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }

      return true;
    } catch {
      logout();
      return false;
    }
  }, [apiUrl, logout]);

  const getUser = useCallback(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem('token');
  }, []);

  return {
    login,
    register,
    logout,
    refreshToken,
    getUser,
    isAuthenticated,
    loading,
    error,
  };
}
