"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Mic, Search, Zap, Image } from 'lucide-react';
import { useAgent } from '@/contexts/AgentContext';

export default function TaskTemplates() {
  const { agents } = useAgent();
  
  const taskTemplates = [
    {
      id: 'analyze-image',
      name: 'Image Analysis',
      description: 'Analyze images using computer vision and provide detailed insights',
      agents: ['2'] // Vision Analyst
    },
    {
      id: 'voice-to-insight',
      name: 'Voice to Insight',
      description: 'Convert speech to text and extract meaningful insights',
      agents: ['4'] // Action Executor
    },
    {
      id: 'multi-modal-research',
      name: 'Multi-Modal Research',
      description: 'Combine text, image, and audio analysis for comprehensive research',
      agents: ['1', '2', '3', '4'] // All agents
    },
    {
      id: 'real-time-chat',
      name: 'Real-Time Chat',
      description: 'Engage in intelligent conversations with real-time responses',
      agents: ['1', '3'] // Orchestrator and Logic Engine
    }
  ];

  const executeTask = (taskId: string) => {
    console.log('Executing task:', taskId);
    // Add task execution logic here
  };

  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'analyze-image':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className="h-4 w-4" />;
      case 'voice-to-insight':
        return <Mic className="h-4 w-4" />;
      case 'multi-modal-research':
        return <Search className="h-4 w-4" />;
      case 'real-time-chat':
        return <Zap className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getAgentColor = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.color || 'bg-slate-500';
  };

  return (
    <Card className="p-4 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Quick Actions
        </h3>
        <Badge variant="outline" className="text-xs">
          Templates
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {taskTemplates.map((task) => (
          <Button
            key={task.id}
            variant="outline"
            className="h-auto p-3 flex flex-col items-start space-y-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
            onClick={() => executeTask(task.id)}
          >
            <div className="flex items-center space-x-2 w-full">
              {getTaskIcon(task.id)}
              <span className="text-sm font-medium truncate">{task.name}</span>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 text-left">
              {task.description}
            </p>
            
            <div className="flex flex-wrap gap-1 w-full">
              {task.agents.map((agentId) => (
                <div
                  key={agentId}
                  className={`w-2 h-2 rounded-full ${getAgentColor(agentId)}`}
                />
              ))}
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}