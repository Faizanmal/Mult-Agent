'use client';

import { useState } from 'react';
import { useFeedback } from '@/hooks/useFeedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackWidgetProps {
  messageId: string;
  agentId?: string;
  sessionId?: string;
}

export function FeedbackWidget({ messageId, agentId, sessionId }: FeedbackWidgetProps) {
  const { quickRating, thumbs, submitFeedback, loading } = useFeedback();
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleRating = async (rating: number) => {
    setSelectedRating(rating);
    const success = await quickRating(messageId, rating);
    if (success) {
      toast.success(`Rated ${rating} stars`);
    } else {
      toast.error('Failed to submit rating');
    }
  };

  const handleThumbs = async (isUp: boolean) => {
    const success = await thumbs(messageId, isUp);
    if (success) {
      toast.success(isUp ? 'Thumbs up!' : 'Thumbs down');
    } else {
      toast.error('Failed to submit feedback');
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    const success = await submitFeedback({
      feedback_type: 'text',
      comment,
      message_id: messageId,
      agent_id: agentId,
      session_id: sessionId,
    });

    if (success) {
      toast.success('Feedback submitted');
      setComment('');
      setShowComment(false);
    } else {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-2">
      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        {/* Star Rating */}
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRating(rating)}
              disabled={loading}
              className="transition-colors hover:text-yellow-500"
            >
              <Star
                className={`h-4 w-4 ${
                  selectedRating && rating <= selectedRating
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Thumbs */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleThumbs(true)}
          disabled={loading}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleThumbs(false)}
          disabled={loading}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>

        {/* Comment Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComment(!showComment)}
        >
          Comment
        </Button>
      </div>

      {/* Comment Box */}
      {showComment && (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowComment(false);
                setComment('');
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={loading || !comment.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
