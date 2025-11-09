"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Agent {
  id: string;
  name: string;
  type: 'orchestrator' | 'vision' | 'reasoning' | 'action' | 'memory';
  status: 'idle' | 'active' | 'processing' | 'error';
  capabilities: string[];
  color: string;
  lastActive?: Date;
  latency?: number;
  avatar?: React.ReactNode;
  performance?: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedAgent?: string;
  priority: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'file';
}

export interface ToolCall {
  tool: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export interface ReasoningStep {
  id: string;
  step: string;
  timestamp: Date;
  agent: string;
  agentId: string;
  type: 'analysis' | 'decision' | 'action' | 'reflection';
  reasoning: string;
  confidence?: number;
  details?: string;
  toolCalls?: ToolCall[];
}

export interface WorkflowNode {
  id: string;
  agentId: string;
  position: { x: number; y: number };
  connections: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  template: boolean;
  createdAt?: Date;
}

interface AgentContextType {
  agents: Agent[];
  tasks: Task[];
  messages: AgentMessage[];
  workflows: Workflow[];
  activeAgents: Set<string>;
  isOrchestrating: boolean;
  reasoningSteps: ReasoningStep[];
  agentMetrics: Record<string, number>;
  
  // Agent management
  addAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  activateAgent: (id: string) => void;
  deactivateAgent: (id: string) => void;
  
  // Task management
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  // Message management
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  
  // Workflow management
  saveWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt'>) => void;
  executeWorkflow: (id: string) => void;
  
  // Orchestration
  startOrchestration: () => void;
  stopOrchestration: () => void;
  
  // Enhanced coordination methods
  optimizeAgentSelection: (taskType: string, taskDescription: string) => string[];
  getAgentPerformance: (agentId: string) => number;
  updateAgentPerformance: (agentId: string, metric: string, value: number) => void;
  
  // Session management
  exportSession: (format: 'json' | 'csv') => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

interface AgentProviderProps {
  children: React.ReactNode;
}

export default function AgentProvider({ children }: AgentProviderProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Master Orchestrator',
      type: 'orchestrator',
      status: 'active',
      capabilities: ['task_coordination', 'agent_management'],
      color: 'bg-blue-500',
      performance: { accuracy: 95, speed: 90, reliability: 98 }
    },
    {
      id: '2',
      name: 'Vision Analyst',
      type: 'vision',
      status: 'idle',
      capabilities: ['image_analysis', 'object_detection'],
      color: 'bg-purple-500',
      performance: { accuracy: 88, speed: 85, reliability: 92 }
    },
    {
      id: '3',
      name: 'Logic Engine',
      type: 'reasoning',
      status: 'idle',
      capabilities: ['logical_analysis', 'decision_making'],
      color: 'bg-green-500',
      performance: { accuracy: 93, speed: 87, reliability: 95 }
    },
    {
      id: '4',
      name: 'Action Executor',
      type: 'action',
      status: 'idle',
      capabilities: ['task_execution', 'api_integration'],
      color: 'bg-orange-500',
      performance: { accuracy: 91, speed: 94, reliability: 89 }
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set(['1']));
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [agentMetrics] = useState<Record<string, number>>({});

  const addAgent = useCallback((agentData: Omit<Agent, 'id'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: Date.now().toString(),
    };
    setAgents(prev => [...prev, newAgent]);
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    ));
  }, []);

  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
    setActiveAgents(prev => {
      const newActive = new Set(prev);
      newActive.delete(id);
      return newActive;
    });
  }, []);

  const activateAgent = useCallback((id: string) => {
    setActiveAgents(prev => new Set([...prev, id]));
    updateAgent(id, { status: 'active', lastActive: new Date() });
  }, [updateAgent]);

  const deactivateAgent = useCallback((id: string) => {
    setActiveAgents(prev => {
      const newActive = new Set(prev);
      newActive.delete(id);
      return newActive;
    });
    updateAgent(id, { status: 'idle' });
  }, [updateAgent]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const addMessage = useCallback((messageData: Omit<AgentMessage, 'id' | 'timestamp'>) => {
    const newMessage: AgentMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const startOrchestration = useCallback(() => {
    setIsOrchestrating(true);
    setReasoningSteps([]);
  }, []);

  const stopOrchestration = useCallback(() => {
    setIsOrchestrating(false);
  }, []);

  const saveWorkflow = useCallback((workflowData: Omit<Workflow, 'id' | 'createdAt'>) => {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  }, []);

  const executeWorkflow = useCallback((id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      console.log('Executing workflow:', workflow);
      // Add workflow execution logic here
      // For now, just start orchestration
      setIsOrchestrating(true);
    }
  }, [workflows]);

  const exportSession = useCallback((format: 'json' | 'csv') => {
    const sessionData = {
      agents,
      messages,
      reasoningSteps,
      timestamp: new Date().toISOString(),
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(sessionData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `session-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      // Simple CSV export for messages
      const csvContent = [
        ['Timestamp', 'Sender', 'Content', 'Type'].join(','),
        ...messages.map(msg => [
          msg.timestamp.toISOString(),
          msg.sender,
          `"${msg.content.replace(/"/g, '""')}"`,
          msg.type
        ].join(','))
      ].join('\n');
      
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `messages-${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [agents, messages, reasoningSteps]);

  // Enhanced agent performance tracking
  const [agentPerformance, setAgentPerformance] = useState<Record<string, Record<string, number>>>({});
  
  // Enhanced agent selection optimization
  const optimizeAgentSelection = useCallback((taskType: string, taskDescription: string) => {
    // Simple keyword-based agent selection optimization
    const keywords = taskDescription.toLowerCase().split(' ');
    const recommendedAgents: string[] = [];
    
    // Match keywords to agent capabilities
    agents.forEach(agent => {
      if (agent.status !== 'active') return;
      
      const capabilities = agent.capabilities.map(cap => cap.toLowerCase());
      const matches = keywords.filter(keyword => 
        capabilities.some(capability => capability.includes(keyword))
      );
      
      // If we have matches and agent is not already recommended
      if (matches.length > 0 && !recommendedAgents.includes(agent.id)) {
        recommendedAgents.push(agent.id);
      }
    });
    
    // If no specific matches, recommend all active agents
    if (recommendedAgents.length === 0) {
      agents.forEach(agent => {
        if (agent.status === 'active' && !recommendedAgents.includes(agent.id)) {
          recommendedAgents.push(agent.id);
        }
      });
    }
    
    return recommendedAgents;
  }, [agents]);
  
  // Get agent performance metric
  const getAgentPerformance = useCallback((agentId: string) => {
    const agentMetrics = agentPerformance[agentId] || {};
    const metricValues = Object.values(agentMetrics);
    
    if (metricValues.length === 0) return 0.5; // Default neutral score
    
    // Calculate average performance score
    const sum = metricValues.reduce((acc, val) => acc + val, 0);
    return sum / metricValues.length;
  }, [agentPerformance]);
  
  // Update agent performance metric
  const updateAgentPerformance = useCallback((agentId: string, metric: string, value: number) => {
    setAgentPerformance(prev => {
      const agentMetrics = prev[agentId] || {};
      return {
        ...prev,
        [agentId]: {
          ...agentMetrics,
          [metric]: value
        }
      };
    });
  }, []);

  const value: AgentContextType = {
    agents,
    tasks,
    messages,
    workflows,
    activeAgents,
    isOrchestrating,
    reasoningSteps,
    agentMetrics,
    addAgent,
    updateAgent,
    removeAgent,
    activateAgent,
    deactivateAgent,
    addTask,
    updateTask,
    addMessage,
    saveWorkflow,
    executeWorkflow,
    startOrchestration,
    stopOrchestration,
    exportSession,
    // Enhanced methods
    optimizeAgentSelection,
    getAgentPerformance,
    updateAgentPerformance
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}