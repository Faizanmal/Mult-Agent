"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export type QuotaLimitDetail = {
  message: string;
  used?: number;
  limit?: number;
  tier?: string;
};

const EVENT_NAME = 'quota-limit-reached';

export function dispatchQuotaLimit(detail: QuotaLimitDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

export function QuotaUpgradeDialog() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<QuotaLimitDetail | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<QuotaLimitDetail>;
      setDetail(custom.detail);
      setOpen(true);
      trackEvent('quota_limit_hit', {
        tier: custom.detail?.tier,
        used: custom.detail?.used,
        limit: custom.detail?.limit,
      });
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Monthly message limit reached
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            <span className="block">
              {detail?.message ||
                'You have used all messages on your current plan for this month.'}
            </span>
            {detail?.used != null && detail?.limit != null && (
              <span className="block text-sm font-medium text-foreground">
                Usage: {detail.used.toLocaleString()} / {detail.limit.toLocaleString()} messages
                {detail.tier ? ` (${detail.tier} plan)` : ''}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Not now
          </Button>
          <Button asChild onClick={() => trackEvent('upgrade_clicked', { source: 'quota_dialog' })}>
            <Link href="/settings/billing">Upgrade plan</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
