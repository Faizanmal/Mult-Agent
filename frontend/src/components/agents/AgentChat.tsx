"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'idle' | 'processing' | 'error';
  latency: number;
  color: string;
}

interface AgentChatProps {
  agent: Agent;
}

export default function AgentChat({ agent }: AgentChatProps) {
  return (
    <div className="h-96">
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          <Card className="p-3 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{agent.avatar}</span>
              <span className="font-medium text-sm">{agent.name}</span>
              <Badge variant={agent.status === 'processing' ? 'default' : 'secondary'}>
                {agent.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Agent is ready to assist. Latency: {agent.latency}ms
            </p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}