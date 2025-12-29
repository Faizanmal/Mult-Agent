// Analytics Dashboard Hook
import { useState, useCallback } from 'react';

export interface DashboardData {
  agents: {
    total: number;
    active: number;
  };
  sessions: {
    total: number;
    active: number;
  };
  messages: {
    today: number;
  };
  executions: {
    week_total: number;
    success_rate: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    redis: { status: string; enabled: boolean };
    cosmosdb: { status: string; enabled: boolean };
    database: { status: string; enabled: boolean };
  };
}

export interface UsageTrend {
  date: string;
  executions: number;
  avg_duration_ms: number;
  total_tokens: number;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboard = useCallback(async (): Promise<DashboardData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reporting/dashboard/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemHealth = useCallback(async (): Promise<SystemHealth | null> => {
    try {
      const response = await fetch('/api/reporting/system_health/', {
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

  const getUsageTrends = useCallback(async (
    days: number = 30
  ): Promise<{ trends: UsageTrend[] } | null> => {
    try {
      const response = await fetch(
        `/api/reporting/usage_trends/?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const getModelUsage = useCallback(async (days: number = 30) => {
    try {
      const response = await fetch(
        `/api/reporting/model_usage/?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const getPerformanceMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/reporting/performance/', {
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
    getDashboard,
    getSystemHealth,
    getUsageTrends,
    getModelUsage,
    getPerformanceMetrics,
    loading,
    error,
  };
}
