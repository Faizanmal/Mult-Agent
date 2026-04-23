"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Trash2,
  Settings,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Bot,
  Target,
  Layers,
  Shuffle,
  Crown,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Agent teams/swarms
const teams = [
  {
    id: '1',
    name: 'Customer Support Team',
    description: 'Handles customer inquiries and support tickets',
    coordinator: 'Support Orchestrator',
    agents: [
      { id: 'a1', name: 'Ticket Classifier', role: 'classifier', status: 'active' },
      { id: 'a2', name: 'Knowledge Retriever', role: 'retriever', status: 'active' },
      { id: 'a3', name: 'Response Generator', role: 'generator', status: 'active' },
      { id: 'a4', name: 'Quality Checker', role: 'validator', status: 'idle' },
    ],
    status: 'running',
    tasksCompleted: 1542,
    avgResponseTime: '2.3s',
    successRate: 98.5,
  },
  {
    id: '2',
    name: 'Data Analysis Swarm',
    description: 'Parallel data processing and analysis pipeline',
    coordinator: 'Analysis Orchestrator',
    agents: [
      { id: 'a5', name: 'Data Ingester', role: 'ingestion', status: 'active' },
      { id: 'a6', name: 'Data Cleaner', role: 'processing', status: 'active' },
      { id: 'a7', name: 'Statistical Analyzer', role: 'analysis', status: 'active' },
      { id: 'a8', name: 'Report Generator', role: 'output', status: 'active' },
      { id: 'a9', name: 'Visualization Agent', role: 'output', status: 'idle' },
    ],
    status: 'running',
    tasksCompleted: 856,
    avgResponseTime: '15.2s',
    successRate: 99.2,
  },
  {
    id: '3',
    name: 'Research Team',
    description: 'Autonomous research and information gathering',
    coordinator: 'Research Lead',
    agents: [
      { id: 'a10', name: 'Query Planner', role: 'planning', status: 'active' },
      { id: 'a11', name: 'Web Researcher', role: 'research', status: 'active' },
      { id: 'a12', name: 'Fact Checker', role: 'validation', status: 'idle' },
    ],
    status: 'idle',
    tasksCompleted: 324,
    avgResponseTime: '45.8s',
    successRate: 95.8,
  },
];

// Active tasks
const activeTasks = [
  { id: '1', task: 'Process support ticket #4521', team: 'Customer Support Team', progress: 75, step: 'Generating response', eta: '5s' },
  { id: '2', task: 'Analyze Q4 sales data', team: 'Data Analysis Swarm', progress: 45, step: 'Statistical analysis', eta: '30s' },
  { id: '3', task: 'Process support ticket #4522', team: 'Customer Support Team', progress: 30, step: 'Retrieving knowledge', eta: '8s' },
];

// Coordination patterns
const coordinationPatterns = [
  { id: '1', name: 'Sequential', description: 'Agents execute in order', icon: ArrowRight },
  { id: '2', name: 'Parallel', description: 'Agents execute simultaneously', icon: Layers },
  { id: '3', name: 'Hierarchical', description: 'Lead agent coordinates others', icon: Crown },
  { id: '4', name: 'Round Robin', description: 'Tasks distributed cyclically', icon: Shuffle },
  { id: '5', name: 'Consensus', description: 'Agents vote on decisions', icon: Users },
  { id: '6', name: 'Blackboard', description: 'Shared knowledge space', icon: Target },
];

export default function CoordinationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const stats = [
    { label: 'Active Teams', value: teams.filter(t => t.status === 'running').length, icon: Network, color: 'text-primary' },
    { label: 'Total Agents', value: teams.reduce((acc, t) => acc + t.agents.length, 0), icon: Bot, color: 'text-blue-500' },
    { label: 'Tasks/Hour', value: '245', icon: Zap, color: 'text-yellow-500' },
    { label: 'Avg Success', value: '97.8%', icon: Target, color: 'text-green-500' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'classifier': return 'bg-blue-500/10 text-blue-500';
      case 'retriever': return 'bg-purple-500/10 text-purple-500';
      case 'generator': return 'bg-green-500/10 text-green-500';
      case 'validator': return 'bg-orange-500/10 text-orange-500';
      case 'ingestion': return 'bg-cyan-500/10 text-cyan-500';
      case 'processing': return 'bg-indigo-500/10 text-indigo-500';
      case 'analysis': return 'bg-pink-500/10 text-pink-500';
      case 'output': return 'bg-emerald-500/10 text-emerald-500';
      case 'planning': return 'bg-amber-500/10 text-amber-500';
      case 'research': return 'bg-violet-500/10 text-violet-500';
      case 'validation': return 'bg-rose-500/10 text-rose-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Network className="h-8 w-8 text-primary" />
              Multi-Agent Coordination
            </h1>
            <p className="text-muted-foreground mt-1">
              Orchestrate and manage agent teams for complex tasks
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn("p-2 rounded-lg bg-muted/50", stat.color)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams">Agent Teams</TabsTrigger>
            <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="patterns">Coordination Patterns</TabsTrigger>
          </TabsList>

          {/* Agent Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "overflow-hidden",
                    team.status === 'running' && "border-green-500/30"
                  )}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl",
                            team.status === 'running' ? "bg-green-500/10" : "bg-muted"
                          )}>
                            <Network className={cn(
                              "h-6 w-6",
                              team.status === 'running' ? "text-green-500" : "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {team.name}
                              <Badge variant={team.status === 'running' ? 'default' : 'secondary'}>
                                {team.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{team.description}</CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Crown className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{team.coordinator}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {team.status === 'running' ? (
                            <Button variant="outline" size="icon">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="icon">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Agent Network Visualization */}
                      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-muted/50 mb-4">
                        {team.agents.map((agent, idx) => (
                          <React.Fragment key={agent.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                agent.status === 'active' ? "bg-green-500/20" : "bg-muted"
                              )}>
                                <Bot className={cn(
                                  "h-4 w-4",
                                  agent.status === 'active' ? "text-green-500" : "text-muted-foreground"
                                )} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{agent.name}</p>
                                <Badge variant="outline" className={cn("text-xs", getRoleColor(agent.role))}>
                                  {agent.role}
                                </Badge>
                              </div>
                            </div>
                            {idx < team.agents.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Team Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{team.tasksCompleted}</p>
                          <p className="text-xs text-muted-foreground">Tasks Completed</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{team.avgResponseTime}</p>
                          <p className="text-xs text-muted-foreground">Avg Response</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-green-500">{team.successRate}%</p>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Active Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Coordination Tasks</CardTitle>
                <CardDescription>Real-time view of tasks being processed by agent teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{task.task}</p>
                        <p className="text-sm text-muted-foreground">{task.team}</p>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        ETA: {task.eta}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{task.step}</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coordination Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coordinationPatterns.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4 transition-transform group-hover:scale-110">
                        <pattern.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{pattern.name}</h3>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Team Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Agent Team</DialogTitle>
              <DialogDescription>
                Configure a new multi-agent team for coordinated tasks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input id="name" placeholder="My Agent Team" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="What does this team do?" />
              </div>
              <div className="space-y-2">
                <Label>Coordination Pattern</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {coordinationPatterns.map(pattern => (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        {pattern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Add Agents</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1 py-1.5 px-3">
                    <Bot className="h-3 w-3" />
                    Select agents...
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
