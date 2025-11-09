"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Brain, Eye, Cpu, Zap, Database, TrendingUp, AlertTriangle } from 'lucide-react';

interface AgentPerformanceData {
  id: string;
  name: string;
  type: 'orchestrator' | 'vision' | 'reasoning' | 'action' | 'memory';
  status: 'idle' | 'active' | 'processing' | 'error';
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    responseTime: number;
    successRate: number;
  };
  tasksCompleted: number;
  tasksFailed: number;
  lastActive: string;
}

const agentTypeIcons = {
  orchestrator: Brain,
  vision: Eye,
  reasoning: Cpu,
  action: Zap,
  memory: Database,
};

const agentTypeColors = {
  orchestrator: '#3b82f6',
  vision: '#8b5cf6',
  reasoning: '#10b981',
  action: '#f59e0b',
  memory: '#6366f1',
};

const performanceData: AgentPerformanceData[] = [
  {
    id: '1',
    name: 'Master Orchestrator',
    type: 'orchestrator',
    status: 'active',
    performance: {
      accuracy: 95,
      speed: 90,
      reliability: 98,
      responseTime: 0.18,
      successRate: 97
    },
    tasksCompleted: 1240,
    tasksFailed: 32,
    lastActive: '2023-05-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Vision Analyst',
    type: 'vision',
    status: 'active',
    performance: {
      accuracy: 88,
      speed: 85,
      reliability: 92,
      responseTime: 0.25,
      successRate: 91
    },
    tasksCompleted: 876,
    tasksFailed: 78,
    lastActive: '2023-05-15T14:28:00Z'
  },
  {
    id: '3',
    name: 'Logic Engine',
    type: 'reasoning',
    status: 'processing',
    performance: {
      accuracy: 93,
      speed: 87,
      reliability: 95,
      responseTime: 0.22,
      successRate: 94
    },
    tasksCompleted: 1056,
    tasksFailed: 54,
    lastActive: '2023-05-15T14:32:00Z'
  },
  {
    id: '4',
    name: 'Action Executor',
    type: 'action',
    status: 'active',
    performance: {
      accuracy: 91,
      speed: 94,
      reliability: 89,
      responseTime: 0.15,
      successRate: 92
    },
    tasksCompleted: 1432,
    tasksFailed: 98,
    lastActive: '2023-05-15T14:29:00Z'
  },
  {
    id: '5',
    name: 'Memory Keeper',
    type: 'memory',
    status: 'idle',
    performance: {
      accuracy: 96,
      speed: 92,
      reliability: 97,
      responseTime: 0.12,
      successRate: 98
    },
    tasksCompleted: 2105,
    tasksFailed: 21,
    lastActive: '2023-05-15T14:25:00Z'
  }
];

export default function AgentPerformanceDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Prepare data for charts
  const performanceMetrics = performanceData.map(agent => ({
    name: agent.name,
    accuracy: agent.performance.accuracy,
    speed: agent.performance.speed,
    reliability: agent.performance.reliability,
    successRate: agent.performance.successRate
  }));

  const responseTimes = performanceData.map(agent => ({
    name: agent.name,
    responseTime: agent.performance.responseTime
  }));

  const taskCompletion = performanceData.map(agent => ({
    name: agent.name,
    completed: agent.tasksCompleted,
    failed: agent.tasksFailed
  }));

  const agentDistribution = Object.entries(
    performanceData.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your multi-agent system performance
          </p>
        </div>
        <div className="flex gap-2">
          <Badge 
            variant={timeRange === '24h' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setTimeRange('24h')}
          >
            24h
          </Badge>
          <Badge 
            variant={timeRange === '7d' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setTimeRange('7d')}
          >
            7d
          </Badge>
          <Badge 
            variant={timeRange === '30d' ? 'default' : 'outline'} 
            className="cursor-pointer"
            onClick={() => setTimeRange('30d')}
          >
            30d
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.length}</div>
            <p className="text-xs text-muted-foreground">5 active agents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(performanceData.reduce((sum, agent) => sum + agent.performance.successRate, 0) / performanceData.length)}%
            </div>
            <p className="text-xs text-muted-foreground">+2.3% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(performanceData.reduce((sum, agent) => sum + agent.performance.responseTime, 0) / performanceData.length).toFixed(2)}s
            </div>
            <p className="text-xs text-muted-foreground">-0.03s from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.reduce((sum, agent) => sum + agent.tasksCompleted, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData.reduce((sum, agent) => sum + agent.tasksFailed, 0)} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Accuracy, speed, and reliability across all agents
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" />
                <Bar dataKey="speed" fill="#10b981" name="Speed" />
                <Bar dataKey="reliability" fill="#8b5cf6" name="Reliability" />
                <Bar dataKey="successRate" fill="#f59e0b" name="Success Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
            <CardDescription>
              Average response time per agent (seconds)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responseTime" fill="#ef4444" name="Response Time (s)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Completion */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>
              Completed vs failed tasks per agent
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Distribution */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Agent Distribution</CardTitle>
            <CardDescription>
              Distribution of agent types in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {agentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(agentTypeColors)[index % Object.values(agentTypeColors).length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Details</CardTitle>
          <CardDescription>
            Detailed performance metrics for each agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Accuracy</th>
                  <th className="text-left py-3 px-4">Speed</th>
                  <th className="text-left py-3 px-4">Reliability</th>
                  <th className="text-left py-3 px-4">Response Time</th>
                  <th className="text-left py-3 px-4">Success Rate</th>
                  <th className="text-left py-3 px-4">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((agent) => {
                  const IconComponent = agentTypeIcons[agent.type];
                  const color = agentTypeColors[agent.type];
                  
                  return (
                    <tr key={agent.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" style={{ color }} />
                          <span>{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">{agent.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                          <span className="capitalize">{agent.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={agent.performance.accuracy} className="w-24" />
                          <span className="text-sm w-10">{agent.performance.accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={agent.performance.speed} className="w-24" />
                          <span className="text-sm w-10">{agent.performance.speed}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={agent.performance.reliability} className="w-24" />
                          <span className="text-sm w-10">{agent.performance.reliability}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{agent.performance.responseTime.toFixed(2)}s</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={agent.performance.successRate} className="w-24" />
                          <span className="text-sm w-10">{agent.performance.successRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-green-600">{agent.tasksCompleted}</span>
                          <span>/</span>
                          <span className="text-red-600">{agent.tasksFailed}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}