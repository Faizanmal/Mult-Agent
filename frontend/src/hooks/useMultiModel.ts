// Multi-Model Intelligence Hook
import { useState, useCallback } from 'react';

export interface ModelPreference {
  preferred_provider?: string;
  preferred_model?: string;
  priority: 'cost' | 'balanced' | 'quality';
  max_cost_per_request?: number;
  fallback_enabled: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  model_used: string;
  provider: string;
  tokens_used: number;
  duration_ms: number;
  cost: number;
  was_fallback: boolean;
}

export function useMultiModel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chat = useCallback(async (
    messages: ChatMessage[],
    options?: {
      priority?: 'cost' | 'balanced' | 'quality';
      model_preference?: string;
    }
  ): Promise<ChatResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multimodel/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          messages,
          priority: options?.priority || 'balanced',
          model_preference: options?.model_preference,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPreferences = useCallback(async (): Promise<ModelPreference | null> => {
    try {
      const response = await fetch('/api/multimodel/preferences/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updatePreferences = useCallback(async (
    preferences: Partial<ModelPreference>
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/multimodel/preferences/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });

      return response.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const getModels = useCallback(async () => {
    try {
      const response = await fetch('/api/multimodel/models/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const getPerformance = useCallback(async () => {
    try {
      const response = await fetch('/api/multimodel/performance/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  return {
    chat,
    getPreferences,
    updatePreferences,
    getModels,
    getPerformance,
    loading,
    error,
  };
}
