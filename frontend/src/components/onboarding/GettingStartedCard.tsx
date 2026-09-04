"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, Plug, CheckCircle2, Circle } from 'lucide-react';

type Props = {
  hasAgents?: boolean;
  hasMessages?: boolean;
  hasIntegrations?: boolean;
  className?: string;
};

export function GettingStartedCard({
  hasAgents = false,
  hasMessages = false,
  hasIntegrations = false,
  className,
}: Props) {
  const steps = [
    {
      done: hasAgents,
      title: 'Create your first agent',
      description: 'Pick a type (orchestrator, reasoning, action) and give it a clear job.',
      href: '/agents',
      cta: 'Create agent',
      icon: Bot,
    },
    {
      done: hasMessages,
      title: 'Send your first message',
      description: 'Open Chat, select the agent, and ask it to do something concrete.',
      href: '/chat',
      cta: 'Start chat',
      icon: MessageSquare,
    },
    {
      done: hasIntegrations,
      title: 'Connect an integration (optional)',
      description: 'Link Slack, GitHub, or Drive so agents can act on real tools.',
      href: '/integrations',
      cta: 'Connect apps',
      icon: Plug,
    },
  ];

  if (hasAgents && hasMessages) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Get to first value</CardTitle>
        <CardDescription>
          Complete these steps to confirm your workspace is working before you invite others.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3"
          >
            <div className="flex items-start gap-3 flex-1">
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
              </div>
            </div>
            {!step.done && (
              <Button asChild size="sm" className="shrink-0">
                <Link href={step.href}>{step.cta}</Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
