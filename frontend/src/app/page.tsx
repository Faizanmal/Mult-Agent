"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import MainWorkspace from '@/components/workspace/MainWorkspace';
import AgentProvider from "@/contexts/AgentContext";
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { EnhancedAgentPanel } from '@/components/agents/EnhancedAgentPanel';
import { OrchestrationPanel } from '@/components/orchestration/OrchestrationPanel';
import { InputBar } from '@/components/input/InputBar';
import { ApiHealthStatus } from '@/components/status/ApiHealthStatus';
import { ApiConnectionTest } from '@/components/test/ApiConnectionTest';
import ProjectOverview from '@/components/project/ProjectOverview';
import APIIntegrationHub from '@/components/integrations/APIIntegrationHub';
import AdvancedReportingDashboard from '@/components/reporting/AdvancedReportingDashboard';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import DataPipelineManager from '@/components/data/DataPipelineManager';
import AgentChatInterface from '@/components/chat/AgentChatInterface';
import AgentPerformanceDashboard from '@/components/performance/AgentPerformanceDashboard';
import PluginHub from '@/components/plugins/PluginHub';
import PWAProvider from '@/contexts/PWAContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Eye, Cpu, Zap, Activity, Settings, Globe, BarChart3, Bell, Database, MessageSquare, TrendingUp } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: 'orchestrator' | 'vision' | 'reasoning' | 'action' | 'memory';
  status: 'idle' | 'active' | 'processing' | 'error';
  capabilities: string[];
}

interface Session {
  id: string;
  name: string;
  agents: Agent[];
  isActive: boolean;
  messageCount: number;
}

const agentTypeIcons = {
  orchestrator: Brain,
  vision: Eye,
  reasoning: Cpu,
  action: Zap,
  memory: Activity
};

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    // Initialize with sample data
    const mockSession: Session = {
      id: '1',
      name: 'Multi-Agent Intelligence Hub',
      agents: [
        {
          id: '1',
          name: 'Master Orchestrator',
          type: 'orchestrator',
          status: 'active',
          capabilities: ['task_coordination', 'agent_management', 'workflow_optimization', 'real_time_sync']
        },
        {
          id: '2',
          name: 'Vision Analyst',
          type: 'vision',
          status: 'idle',
          capabilities: ['image_analysis', 'object_detection', 'ocr', 'visual_reasoning', 'video_processing']
        },
        {
          id: '3',
          name: 'Logic Engine',
          type: 'reasoning',
          status: 'idle',
          capabilities: ['logical_analysis', 'problem_solving', 'decision_making', 'pattern_recognition', 'inference']
        },
        {
          id: '4',
          name: 'Action Executor',
          type: 'action',
          status: 'idle',
          capabilities: ['api_integration', 'task_execution', 'external_tools', 'automation', 'mcp_tools']
        },
        {
          id: '5',
          name: 'Memory Keeper',
          type: 'memory',
          status: 'active',
          capabilities: ['context_storage', 'knowledge_retrieval', 'learning', 'history_management', 'semantic_search']
        }
      ],
      isActive: true,
      messageCount: 0
    };

    setAgents(mockSession.agents);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">Initializing Multi-Agent System...</p>
            <p className="text-sm text-muted-foreground mt-2">Connecting agents and establishing workflows</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <PWAProvider>
      <ThemeProvider>
        <AgentProvider>
          <WebSocketProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Header />
            
            <div className="container mx-auto px-4 py-6">
              {/* Hero Section */}
              <div className="mb-8 text-center">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Beyond Chatbots
                </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Intelligent agent orchestration with real-time performance, multi-modal intelligence, 
                and genuine problem-solving capabilities powered by Groq&apos;s lightning-fast inference.
              </p>
            </div>

            {/* Main Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-10 mb-8">
                <TabsTrigger value="project" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Project
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  APIs
                </TabsTrigger>
                <TabsTrigger value="reporting" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Pipelines
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="orchestration" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Orchestration
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="plugins" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Plugins
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  API Test
                </TabsTrigger>
              </TabsList>

              <TabsContent value="integrations" className="mt-6">
                <APIIntegrationHub />
              </TabsContent>

              <TabsContent value="reporting" className="mt-6">
                <AdvancedReportingDashboard />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <NotificationCenter />
              </TabsContent>

              <TabsContent value="data" className="mt-6">
                <DataPipelineManager />
              </TabsContent>

              <TabsContent value="project" className="mt-6">
                <ProjectOverview />
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <AgentChatInterface />
              </TabsContent>

              <TabsContent value="dashboard" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* API Health Status */}
                  <ApiHealthStatus />
                  
                  {/* System Status */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        System Health
                      </CardTitle>
                      <CardDescription>Real-time system performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Active Agents</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {agents.filter(a => a.status === 'active').length} / {agents.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Processing Tasks</span>
                          <Badge variant="secondary">
                            {agents.filter(a => a.status === 'processing').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Avg Response Time</span>
                          <Badge variant="outline" className="text-blue-600">~185ms</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Groq Inference</span>
                          <Badge variant="outline" className="text-purple-600">Ultra-Fast</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Agents Overview */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-500" />
                        Agent Network
                      </CardTitle>
                      <CardDescription>Specialized agents in coordination</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {agents.map(agent => {
                          const IconComponent = agentTypeIcons[agent.type];
                          return (
                            <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{agent.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Capabilities Overview */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        Multi-Modal Intelligence
                      </CardTitle>
                      <CardDescription>Integrated processing capabilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Vision Processing</span>
                          <Badge variant="outline">Ready</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm">Natural Language</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          <span className="text-sm">Reasoning Engine</span>
                          <Badge variant="outline">Online</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">Real-time Sync</span>
                          <Badge variant="outline">Connected</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>Latest agent interactions and workflow events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Brain className="h-5 w-5 mt-1 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Master Orchestrator initialized workflow coordination</p>
                          <p className="text-xs text-muted-foreground">System ready for multi-agent collaboration • Just now</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Activity className="h-5 w-5 mt-1 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Memory Keeper established context synchronization</p>
                          <p className="text-xs text-muted-foreground">All agents connected to shared knowledge base • 2 min ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Eye className="h-5 w-5 mt-1 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Vision Analyst calibrated for multi-modal processing</p>
                          <p className="text-xs text-muted-foreground">Image, video, and document analysis ready • 5 min ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agents" className="mt-6">
                <EnhancedAgentPanel />
              </TabsContent>

              <TabsContent value="orchestration" className="mt-6">
                <OrchestrationPanel />
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <AgentPerformanceDashboard />
              </TabsContent>

              <TabsContent value="workspace" className="mt-6">
                <MainWorkspace />
              </TabsContent>

              <TabsContent value="plugins" className="mt-6">
                <PluginHub />
              </TabsContent>
              <TabsContent value="test" className="mt-6">
                <ApiConnectionTest />
              </TabsContent>
            </Tabs>
          </div>

          {/* Smart Input Interface - Always accessible */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 z-50">
            <InputBar onSend={(message: string) => console.log('Message sent:', message)} />
          </div>
        </div>
        </WebSocketProvider>
      </AgentProvider>
    </ThemeProvider>
    </PWAProvider>
  );
}