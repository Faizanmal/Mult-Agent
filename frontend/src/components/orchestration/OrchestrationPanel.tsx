"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAgent } from '@/contexts/AgentContext';
import { 
  Brain, 
  Eye, 
  Cpu, 
  Zap, 
  Activity, 
  Network, 
  Play, 
  Pause,
  BarChart3
} from 'lucide-react';

interface OrchestrationPanelProps {
  onWorkflowChange?: (workflow: WorkflowConfig) => void;
  onAgentToggle?: (agentId: string, active: boolean) => void;
}

interface WorkflowConfig {
  mode: 'sequential' | 'parallel';
  agents: string[];
}

const agentTypeIcons = {
  orchestrator: Brain,
  vision: Eye,
  reasoning: Cpu,
  action: Zap,
  memory: Activity
};

function OrchestrationPanel({ onWorkflowChange, onAgentToggle }: OrchestrationPanelProps) {
  const { agents, activeAgents, activateAgent, deactivateAgent } = useAgent();
  const [isCoordinating, setIsCoordinating] = useState(false);
  const [coordinationMode, setCoordinationMode] = useState<'sequential' | 'parallel'>('parallel');

  const handleAgentToggle = (agentId: string, checked: boolean) => {
    if (checked) {
      activateAgent(agentId);
    } else {
      deactivateAgent(agentId);
    }
    
    if (onAgentToggle) {
      onAgentToggle(agentId, checked);
    }
  };

  const startCoordination = () => {
    setIsCoordinating(true);
    
    // Notify parent component of workflow change
    if (onWorkflowChange) {
      onWorkflowChange({
        mode: coordinationMode,
        agents: Array.from(activeAgents)
      });
    }
    
    setTimeout(() => setIsCoordinating(false), 3000);
  };

  const getAgentLoadMetrics = () => {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      tasks: Math.floor(Math.random() * 10)
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Agent Orchestration</span>
          </CardTitle>
          <CardDescription>
            Coordinate multiple agents for complex multi-modal tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Coordination Status</div>
              <div className="text-sm text-muted-foreground">
                {isCoordinating ? 'Actively coordinating agents' : 'Ready to coordinate'}
              </div>
            </div>
            <Button
              onClick={startCoordination}
              disabled={isCoordinating || activeAgents.size === 0}
              className="flex items-center space-x-2"
            >
              {isCoordinating ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Coordinating...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start Coordination</span>
                </>
              )}
            </Button>
          </div>

          {isCoordinating && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Coordination Progress</div>
              <Progress value={33} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Processing multi-agent workflow...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agent Control</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Agents</CardTitle>
              <CardDescription>
                Enable/disable agents for the current session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => {
                  const IconComponent = agentTypeIcons[agent.type];
                  const isActive = activeAgents.has(agent.id);
                  
                  return (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${agent.color}/20`}>
                          <IconComponent className={`h-4 w-4 ${agent.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {agent.type} Agent
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 2).map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={agent.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => handleAgentToggle(agent.id, checked)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coordination Workflow</CardTitle>
              <CardDescription>
                Configure how agents collaborate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Execution Mode</div>
                <div className="flex space-x-2">
                  <Button
                    variant={coordinationMode === 'sequential' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCoordinationMode('sequential')}
                  >
                    Sequential
                  </Button>
                  <Button
                    variant={coordinationMode === 'parallel' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCoordinationMode('parallel')}
                  >
                    Parallel
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Active Workflow</div>
                <div className="p-4 border rounded-lg bg-muted/20">
                  <div className="text-sm text-muted-foreground">
                    {coordinationMode === 'sequential' 
                      ? 'Agents will process tasks in sequence, passing results between stages.'
                      : 'Agents will process tasks in parallel for maximum performance.'
                    }
                  </div>
                  <div className="mt-2 space-y-1">
                    {Array.from(activeAgents).map((agentId, index) => {
                      const agent = agents.find(a => a.id === agentId);
                      if (!agent) return null;
                      
                      return (
                        <div key={agentId} className="flex items-center space-x-2 text-sm">
                          <span className="text-muted-foreground">
                            {coordinationMode === 'sequential' ? `${index + 1}.` : '•'}
                          </span>
                          <span>{agent.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {agent.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(activeAgents).map((agentId) => {
              const agent = agents.find(a => a.id === agentId);
              if (!agent) return null;
              
              const metrics = getAgentLoadMetrics();
              const IconComponent = agentTypeIcons[agent.type];
              
              return (
                <Card key={agentId}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <IconComponent className="h-4 w-4" />
                      <span>{agent.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>{metrics.cpu}%</span>
                      </div>
                      <Progress value={metrics.cpu} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory</span>
                        <span>{metrics.memory}%</span>
                      </div>
                      <Progress value={metrics.memory} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Tasks</span>
                      <Badge variant="secondary">{metrics.tasks}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeAgents.size === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No active agents to show metrics for
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { OrchestrationPanel };
export default OrchestrationPanel;