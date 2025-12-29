// User Feedback Hook
import { useState, useCallback } from 'react';

export interface FeedbackData {
  feedback_type: 'rating' | 'thumbs' | 'text' | 'bug_report' | 'feature_request';
  rating?: number;
  thumbs_up?: boolean;
  comment?: string;
  message_id?: string;
  session_id?: string;
  agent_id?: string;
}

export interface AgentInsights {
  period_days: number;
  total_feedback: number;
  average_rating: number;
  sentiment_breakdown: Record<string, number>;
  rating_data: {
    average_rating: number;
    total_ratings: number;
    thumbs_up: number;
    thumbs_down: number;
    response_quality: number;
  };
  recent_issues: string[];
}

export function useFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (
    data: FeedbackData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const quickRating = useCallback(async (
    messageId: string,
    rating: number
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/feedback/quick_rating/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message_id: messageId,
          rating,
        }),
      });

      return response.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const thumbs = useCallback(async (
    messageId: string,
    thumbsUp: boolean
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/feedback/thumbs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message_id: messageId,
          thumbs_up: thumbsUp,
        }),
      });

      return response.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const getAgentInsights = useCallback(async (
    agentId: string,
    days: number = 30
  ): Promise<AgentInsights | null> => {
    try {
      const response = await fetch(
        `/api/feedback/ratings/agent_insights/?agent_id=${agentId}&days=${days}`,
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

  return {
    submitFeedback,
    quickRating,
    thumbs,
    getAgentInsights,
    loading,
    error,
  };
}
