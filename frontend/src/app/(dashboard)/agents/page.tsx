"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  Eye,
  Cpu,
  Brain,
  Zap,
  Database,
  Settings,
  Activity,
  Clock,
  RefreshCw,
  Grid3X3,
  List,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Agent types configuration
const agentTypes = {
  orchestrator: { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10', gradient: 'from-purple-500 to-pink-500' },
  vision: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-500 to-cyan-500' },
  reasoning: { icon: Cpu, color: 'text-green-500', bg: 'bg-green-500/10', gradient: 'from-green-500 to-emerald-500' },
  action: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', gradient: 'from-orange-500 to-amber-500' },
  memory: { icon: Database, color: 'text-cyan-500', bg: 'bg-cyan-500/10', gradient: 'from-cyan-500 to-teal-500' },
  custom: { icon: Settings, color: 'text-slate-500', bg: 'bg-slate-500/10', gradient: 'from-slate-500 to-gray-500' },
};

// Sample agents data
const sampleAgents = [
  {
    id: '1',
    name: 'Master Orchestrator',
    type: 'orchestrator',
    status: 'active',
    description: 'Coordinates all agent activities and manages workflow execution',
    capabilities: ['task_coordination', 'agent_management', 'workflow_optimization'],
    metrics: { tasks: 1284, successRate: 98.5, avgResponseTime: 42 },
    createdAt: '2024-01-15',
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Vision Analyst',
    type: 'vision',
    status: 'active',
    description: 'Processes and analyzes visual content including images and videos',
    capabilities: ['image_analysis', 'object_detection', 'ocr', 'video_processing'],
    metrics: { tasks: 856, successRate: 95.2, avgResponseTime: 128 },
    createdAt: '2024-01-18',
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Logic Engine',
    type: 'reasoning',
    status: 'idle',
    description: 'Handles complex reasoning, problem-solving, and decision making',
    capabilities: ['logical_analysis', 'problem_solving', 'decision_making'],
    metrics: { tasks: 2156, successRate: 99.1, avgResponseTime: 85 },
    createdAt: '2024-01-20',
    lastActive: '15 min ago',
  },
  {
    id: '4',
    name: 'Action Executor',
    type: 'action',
    status: 'processing',
    description: 'Executes tasks, API calls, and external integrations',
    capabilities: ['api_integration', 'task_execution', 'automation'],
    metrics: { tasks: 4521, successRate: 97.8, avgResponseTime: 156 },
    createdAt: '2024-01-22',
    lastActive: 'Just now',
  },
  {
    id: '5',
    name: 'Memory Keeper',
    type: 'memory',
    status: 'active',
    description: 'Manages context storage, knowledge retrieval, and learning',
    capabilities: ['context_storage', 'knowledge_retrieval', 'semantic_search'],
    metrics: { tasks: 789, successRate: 100, avgResponseTime: 35 },
    createdAt: '2024-01-25',
    lastActive: '1 min ago',
  },
  {
    id: '6',
    name: 'Customer Support Bot',
    type: 'custom',
    status: 'active',
    description: 'Handles customer inquiries and support tickets',
    capabilities: ['chat', 'ticket_management', 'sentiment_analysis'],
    metrics: { tasks: 3456, successRate: 94.5, avgResponseTime: 62 },
    createdAt: '2024-02-01',
    lastActive: '30 sec ago',
  },
];

export default function AgentsPage() {
  const [agents] = useState(sampleAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'processing': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse">Processing</Badge>;
      case 'idle': return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">Idle</Badge>;
      case 'error': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              AI Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and monitor your AI agents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  Create Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                  <DialogDescription>
                    Configure your new AI agent with custom capabilities
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input id="name" placeholder="Enter agent name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Agent Type</Label>
                    <Select defaultValue="custom">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(agentTypes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <value.icon className={cn("h-4 w-4", value.color)} />
                              <span className="capitalize">{key}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe what this agent does" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Capabilities</Label>
                    <div className="flex flex-wrap gap-2">
                      {['task_execution', 'api_integration', 'chat', 'analysis'].map((cap) => (
                        <Badge key={cap} variant="outline" className="cursor-pointer hover:bg-primary/10">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-activate">Auto-activate on creation</Label>
                    <Switch id="auto-activate" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500">
                    Create Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Agents', value: agents.length, icon: Bot, color: 'text-indigo-500' },
            { label: 'Active', value: agents.filter(a => a.status === 'active').length, icon: Activity, color: 'text-green-500' },
            { label: 'Processing', value: agents.filter(a => a.status === 'processing').length, icon: RefreshCw, color: 'text-blue-500' },
            { label: 'Idle', value: agents.filter(a => a.status === 'idle').length, icon: Clock, color: 'text-slate-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-muted", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.keys(agentTypes).map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredAgents.map((agent, index) => {
                const typeConfig = agentTypes[agent.type as keyof typeof agentTypes] || agentTypes.custom;
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      {/* Gradient Header */}
                      <div className={cn("h-2 bg-gradient-to-r", typeConfig.gradient)} />
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeConfig.bg)}>
                              <Icon className={cn("h-5 w-5", typeConfig.color)} />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {agent.name}
                                <span className={cn("h-2 w-2 rounded-full", getStatusColor(agent.status))} />
                              </CardTitle>
                              <CardDescription className="capitalize">{agent.type} Agent</CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Agent
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-4">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {agent.description}
                        </p>

                        {/* Capabilities */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {agent.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-lg font-bold">{agent.metrics.tasks}</p>
                            <p className="text-xs text-muted-foreground">Tasks</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-lg font-bold">{agent.metrics.successRate}%</p>
                            <p className="text-xs text-muted-foreground">Success</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-lg font-bold">{agent.metrics.avgResponseTime}ms</p>
                            <p className="text-xs text-muted-foreground">Avg Time</p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="border-t pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {agent.lastActive}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {agent.status === 'active' ? (
                            <Button variant="ghost" size="sm" className="h-8">
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-8">
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredAgents.map((agent, index) => {
                      const typeConfig = agentTypes[agent.type as keyof typeof agentTypes] || agentTypes.custom;
                      const Icon = typeConfig.icon;

                      return (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", typeConfig.bg)}>
                            <Icon className={cn("h-6 w-6", typeConfig.color)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{agent.name}</h3>
                              {getStatusBadge(agent.status)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
                          </div>

                          <div className="hidden lg:flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-semibold">{agent.metrics.tasks}</p>
                              <p className="text-xs text-muted-foreground">Tasks</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{agent.metrics.successRate}%</p>
                              <p className="text-xs text-muted-foreground">Success</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{agent.metrics.avgResponseTime}ms</p>
                              <p className="text-xs text-muted-foreground">Response</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              {agent.status === 'active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Agent</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Bot className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Button onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
