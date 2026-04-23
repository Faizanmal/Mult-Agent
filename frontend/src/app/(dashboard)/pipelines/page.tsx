"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Plus,
  Search,
  Play,
  Pause,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw,
  Trash2,
  Copy,
  FileJson,
  Cloud,
  Server,
  Zap,
  Activity,
  TrendingUp,
  Layers,
  Eye,
  Edit,
  Calendar,
  Filter,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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

// Pipeline data
const pipelines = [
  {
    id: '1',
    name: 'Customer Data Sync',
    description: 'Sync customer data from CRM to data warehouse',
    status: 'running',
    source: { type: 'api', name: 'Salesforce CRM' },
    destination: { type: 'database', name: 'PostgreSQL' },
    schedule: 'Every 15 min',
    lastRun: '5 min ago',
    nextRun: 'In 10 min',
    recordsProcessed: 15420,
    avgDuration: '2m 15s',
    successRate: 99.8,
  },
  {
    id: '2',
    name: 'Analytics ETL',
    description: 'Extract, transform, and load analytics data',
    status: 'completed',
    source: { type: 'database', name: 'MySQL' },
    destination: { type: 'warehouse', name: 'BigQuery' },
    schedule: 'Daily at 2 AM',
    lastRun: '6 hours ago',
    nextRun: 'Tomorrow 2 AM',
    recordsProcessed: 1250000,
    avgDuration: '45m 30s',
    successRate: 100,
  },
  {
    id: '3',
    name: 'Log Aggregation',
    description: 'Aggregate logs from all services',
    status: 'running',
    source: { type: 'stream', name: 'Kafka' },
    destination: { type: 'search', name: 'Elasticsearch' },
    schedule: 'Real-time',
    lastRun: 'Running',
    nextRun: 'Continuous',
    recordsProcessed: 8956432,
    avgDuration: 'Streaming',
    successRate: 99.5,
  },
  {
    id: '4',
    name: 'Agent Metrics Export',
    description: 'Export agent performance metrics',
    status: 'failed',
    source: { type: 'internal', name: 'Agent Service' },
    destination: { type: 'file', name: 'S3 Bucket' },
    schedule: 'Hourly',
    lastRun: '1 hour ago',
    nextRun: 'Paused',
    recordsProcessed: 45600,
    avgDuration: '5m 20s',
    successRate: 85.2,
    error: 'Connection timeout to destination',
  },
  {
    id: '5',
    name: 'User Behavior Tracking',
    description: 'Track and store user behavior events',
    status: 'idle',
    source: { type: 'webhook', name: 'Event Collector' },
    destination: { type: 'warehouse', name: 'Snowflake' },
    schedule: 'Every 5 min',
    lastRun: '30 min ago',
    nextRun: 'In 5 min',
    recordsProcessed: 562000,
    avgDuration: '1m 45s',
    successRate: 98.7,
  },
];

// Run history
const runHistory = [
  { id: '1', pipeline: 'Customer Data Sync', status: 'success', records: 1542, duration: '2m 12s', timestamp: '14:32:15' },
  { id: '2', pipeline: 'Log Aggregation', status: 'running', records: 89564, duration: '-', timestamp: '14:30:00' },
  { id: '3', pipeline: 'Analytics ETL', status: 'success', records: 1250000, duration: '44m 28s', timestamp: '02:00:00' },
  { id: '4', pipeline: 'Agent Metrics Export', status: 'failed', records: 0, duration: '5m 20s', timestamp: '13:00:00' },
  { id: '5', pipeline: 'Customer Data Sync', status: 'success', records: 1538, duration: '2m 08s', timestamp: '14:17:15' },
];

// Source/destination types with icons
const sourceTypes = {
  api: { icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  database: { icon: Database, color: 'text-green-500', bg: 'bg-green-500/10' },
  stream: { icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  webhook: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  file: { icon: FileJson, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  warehouse: { icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  search: { icon: Server, color: 'text-red-500', bg: 'bg-red-500/10' },
  internal: { icon: GitBranch, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
};

export default function PipelinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<typeof pipelines[0] | null>(null);

  const stats = [
    { label: 'Total Pipelines', value: pipelines.length, icon: GitBranch, color: 'text-primary' },
    { label: 'Running', value: pipelines.filter(p => p.status === 'running').length, icon: Activity, color: 'text-green-500' },
    { label: 'Records Today', value: '12.5M', icon: Database, color: 'text-blue-500' },
    { label: 'Avg Success Rate', value: '96.6%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Running</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <GitBranch className="h-8 w-8 text-primary" />
              Data Pipelines
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your data pipelines
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Pipeline
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

        <Tabs defaultValue="pipelines" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="runs">Run History</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
          </TabsList>

          {/* Pipelines Tab */}
          <TabsContent value="pipelines" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pipelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {pipelines.map((pipeline, index) => {
                const sourceType = sourceTypes[pipeline.source.type as keyof typeof sourceTypes];
                const destType = sourceTypes[pipeline.destination.type as keyof typeof sourceTypes];
                
                return (
                  <motion.div
                    key={pipeline.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "hover:shadow-md transition-shadow",
                      pipeline.status === 'failed' && "border-red-500/30"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Pipeline Icon */}
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                            pipeline.status === 'running' && "bg-green-500/10",
                            pipeline.status === 'completed' && "bg-blue-500/10",
                            pipeline.status === 'failed' && "bg-red-500/10",
                            pipeline.status === 'idle' && "bg-muted"
                          )}>
                            <GitBranch className={cn(
                              "h-6 w-6",
                              pipeline.status === 'running' && "text-green-500",
                              pipeline.status === 'completed' && "text-blue-500",
                              pipeline.status === 'failed' && "text-red-500",
                              pipeline.status === 'idle' && "text-muted-foreground"
                            )} />
                          </div>

                          {/* Pipeline Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{pipeline.name}</h3>
                              {getStatusBadge(pipeline.status)}
                              {pipeline.status === 'running' && (
                                <RefreshCw className="h-3 w-3 text-green-500 animate-spin" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{pipeline.description}</p>
                            
                            {/* Source -> Destination Flow */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded", sourceType.bg)}>
                                  <sourceType.icon className={cn("h-4 w-4", sourceType.color)} />
                                </div>
                                <span className="text-sm font-medium">{pipeline.source.name}</span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded", destType.bg)}>
                                  <destType.icon className={cn("h-4 w-4", destType.color)} />
                                </div>
                                <span className="text-sm font-medium">{pipeline.destination.name}</span>
                              </div>
                            </div>

                            {/* Error Message */}
                            {pipeline.error && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {pipeline.error}
                              </div>
                            )}
                          </div>

                          {/* Pipeline Stats */}
                          <div className="hidden lg:flex flex-col items-end gap-2 text-sm min-w-[200px]">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
                              <span className="text-muted-foreground">Schedule:</span>
                              <span>{pipeline.schedule}</span>
                              <span className="text-muted-foreground">Last Run:</span>
                              <span>{pipeline.lastRun}</span>
                              <span className="text-muted-foreground">Records:</span>
                              <span>{pipeline.recordsProcessed.toLocaleString()}</span>
                              <span className="text-muted-foreground">Success:</span>
                              <span className={cn(
                                pipeline.successRate >= 98 ? "text-green-500" : "text-yellow-500"
                              )}>
                                {pipeline.successRate}%
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {pipeline.status === 'running' ? (
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
                                <DropdownMenuItem onClick={() => setSelectedPipeline(pipeline)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Pipeline
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  View Schedule
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
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Run History Tab */}
          <TabsContent value="runs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>Pipeline execution history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {runHistory.map((run, index) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      {run.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {run.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                      {run.status === 'running' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                      
                      <div className="flex-1">
                        <p className="font-medium">{run.pipeline}</p>
                        <p className="text-sm text-muted-foreground">
                          {run.records.toLocaleString()} records • {run.duration}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {run.timestamp}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(sourceTypes).map(([key, value]) => (
                <Card key={key} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", value.bg)}>
                      <value.icon className={cn("h-6 w-6", value.color)} />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-sm text-muted-foreground">
                        {pipelines.filter(p => p.source.type === key || p.destination.type === key).length} connections
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Pipeline Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Data Pipeline</DialogTitle>
              <DialogDescription>
                Configure a new data pipeline to sync your data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pipeline Name</Label>
                <Input id="name" placeholder="My Data Pipeline" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Sync data from source to destination" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(sourceTypes).map(type => (
                        <SelectItem key={type} value={type}>
                          <span className="capitalize">{type}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(sourceTypes).map(type => (
                        <SelectItem key={type} value={type}>
                          <span className="capitalize">{type}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button>Create Pipeline</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pipeline Details Dialog */}
        <Dialog open={!!selectedPipeline} onOpenChange={() => setSelectedPipeline(null)}>
          <DialogContent className="max-w-2xl">
            {selectedPipeline && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedPipeline.name}
                    {getStatusBadge(selectedPipeline.status)}
                  </DialogTitle>
                  <DialogDescription>{selectedPipeline.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Records Processed</p>
                        <p className="text-2xl font-bold">{selectedPipeline.recordsProcessed.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                        <p className="text-2xl font-bold">{selectedPipeline.successRate}%</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Pipeline Health</p>
                    <Progress value={selectedPipeline.successRate} className="h-2" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-medium">{selectedPipeline.schedule}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Duration</p>
                      <p className="font-medium">{selectedPipeline.avgDuration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Run</p>
                      <p className="font-medium">{selectedPipeline.lastRun}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Run</p>
                      <p className="font-medium">{selectedPipeline.nextRun}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedPipeline(null)}>
                    Close
                  </Button>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
