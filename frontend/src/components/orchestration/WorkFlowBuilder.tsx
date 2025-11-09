"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgent } from '@/contexts/AgentContext';
import { Play, Save, Trash2, ArrowRight } from 'lucide-react';

export default function WorkflowBuilder() {
  const { agents, workflows, executeWorkflow, saveWorkflow } = useAgent();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const createWorkflow = () => {
    if (!workflowName.trim() || selectedAgents.length === 0) return;

    const nodes = selectedAgents.map((agentId, index) => ({
      id: `node-${index}`,
      agentId,
      position: { x: index * 150 + 100, y: 100 },
      connections: index < selectedAgents.length - 1 ? [`node-${index + 1}`] : []
    }));

    saveWorkflow({
      name: workflowName,
      description: workflowDescription || `Custom workflow with ${selectedAgents.length} agents`,
      nodes,
      template: false
    });

    // Reset form
    setWorkflowName('');
    setWorkflowDescription('');
    setSelectedAgents([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Workflow Builder
        </h3>
        <Badge variant="outline" className="text-xs">
          {workflows.length} workflows
        </Badge>
      </div>

      {/* Workflow Creation */}
      <Card className="p-4 bg-slate-50/50 dark:bg-slate-700/50">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
          Create New Workflow
        </h4>
        
        <div className="space-y-3">
          <Input
            placeholder="Workflow name..."
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          
          <Input
            placeholder="Description (optional)..."
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
          />
          
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              Select agents for your workflow:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {agents.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selectedAgents.includes(agent.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAgentSelection(agent.id)}
                  className="justify-start"
                >
                  <span className="mr-2">{agent.avatar}</span>
                  <span className="text-xs truncate">{agent.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {selectedAgents.length > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Pipeline:
              </span>
              {selectedAgents.map((agentId, index) => {
                const agent = agents.find(a => a.id === agentId);
                return (
                  <div key={agentId} className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {agent?.avatar} {agent?.name.split(' ')[0]}
                    </Badge>
                    {index < selectedAgents.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <Button 
            onClick={createWorkflow}
            disabled={!workflowName.trim() || selectedAgents.length === 0}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </Card>

      {/* Existing Workflows */}
      <div>
        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
          Saved Workflows
        </h4>
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="p-3 bg-slate-50/50 dark:bg-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-medium text-slate-900 dark:text-white">
                      {workflow.name}
                    </h5>
                    {workflow.template && (
                      <Badge variant="outline" className="text-xs">
                        Template
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeWorkflow(workflow.id)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    {!workflow.template && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {workflow.description}
                </p>
                
                <div className="flex items-center space-x-1">
                  {workflow.nodes.map((node, index) => {
                    const agent = agents.find(a => a.id === node.agentId);
                    return (
                      <div key={node.id} className="flex items-center space-x-1">
                        <div className={`w-4 h-4 ${agent?.color} rounded-full`} />
                        {index < workflow.nodes.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}