"use client";

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const OPEN_EVENT = 'open-report-issue';

export function openReportIssueDialog() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function ReportIssueDialog() {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug_report' | 'feature_request'>('bug_report');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  const handleSubmit = async () => {
    if (comment.trim().length < 10) {
      toast({
        title: 'Add more detail',
        description: 'Please describe the issue in at least 10 characters.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/feedback/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.detail || 'Failed to submit feedback');
      }

      trackEvent('feedback_submitted', { feedback_type: feedbackType });
      toast({
        title: 'Thanks for the feedback',
        description: 'We received your report and will review it shortly.',
      });
      setComment('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Could not submit',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Tell us what broke or what you need. This helps us prioritize beta fixes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={feedbackType}
              onValueChange={(v) => setFeedbackType(v as 'bug_report' | 'feature_request')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug_report">Bug report</SelectItem>
                <SelectItem value="feature_request">Feature request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue-comment">Details</Label>
            <Textarea
              id="issue-comment"
              placeholder="What happened? What did you expect? Steps to reproduce help a lot."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
