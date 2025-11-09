"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgent, Agent } from '@/contexts/AgentContext';
import { Brain, Eye, Cpu, Zap, Activity, Play, Pause, Settings } from 'lucide-react';

interface AgentPanelProps {
  agents?: Agent[];
  onAgentUpdate?: (agents: Agent[]) => void;
}

const agentTypeIcons = {
  orchestrator: Brain,
  vision: Eye,
  reasoning: Cpu,
  action: Zap,
  memory: Activity
};

function AgentPanel({ agents: propAgents, onAgentUpdate }: AgentPanelProps = {}) {
  const { agents: contextAgents, activeAgents, activateAgent, deactivateAgent } = useAgent();
  
  // Use prop agents if provided, otherwise use context agents
  const agents = propAgents || contextAgents;
  
  const handleToggleAgent = (agentId: string) => {
    if (activeAgents.has(agentId)) {
      deactivateAgent(agentId);
    } else {
      activateAgent(agentId);
    }
    
    // Update parent component if callback provided
    if (onAgentUpdate) {
      const updatedAgents = agents.map(agent => ({
        ...agent,
        status: agent.id === agentId 
          ? (activeAgents.has(agentId) ? 'idle' : 'active') 
          : agent.status
      })) as Agent[];
      onAgentUpdate(updatedAgents);
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const IconComponent = agentTypeIcons[agent.type];
          const isActive = activeAgents.has(agent.id);
          
          return (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${agent.color}/20`}>
                      <IconComponent className={`h-5 w-5 ${agent.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <CardDescription className="text-sm capitalize">{agent.type} Agent</CardDescription>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability.replace('_', ' ')}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {agent.performance && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Performance</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium">{agent.performance.accuracy}%</div>
                        <div className="text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{agent.performance.speed}%</div>
                        <div className="text-muted-foreground">Speed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{agent.performance.reliability}%</div>
                        <div className="text-muted-foreground">Reliability</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleToggleAgent(agent.id)}
                    className="flex-1"
                  >
                    {isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Agents Summary */}
      {Array.from(activeAgents).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Agent Network</CardTitle>
            <CardDescription>
              {Array.from(activeAgents).length} agents currently coordinating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {agents
                .filter(agent => activeAgents.has(agent.id))
                .map((agent) => {
                  const IconComponent = agentTypeIcons[agent.type];
                  return (
                    <div
                      key={agent.id}
                      className="flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-lg"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{agent.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {agent.status}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { AgentPanel };
export default AgentPanel;