"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Plus,
  Search,
  MoreVertical,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Key,
  Globe,
  Zap,
  Database,
  Cloud,
  Bot,
  MessageSquare,
  BarChart3,
  GitBranch,
  Mail,
  Calendar,
  FileText,
  Shield,
  Copy,
  Eye,
  EyeOff,
  TestTube,
  Link2,
  Unlink,
  Clock,
  Activity,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// Integration categories
const categories = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'ai', label: 'AI & ML', icon: Bot },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'devops', label: 'DevOps', icon: GitBranch },
  { id: 'storage', label: 'Storage', icon: Database },
];

// Sample integrations
const integrations = [
  {
    id: '1',
    name: 'OpenAI',
    description: 'Connect to OpenAI GPT models for advanced AI capabilities',
    icon: Bot,
    category: 'ai',
    status: 'connected',
    lastSync: '2 min ago',
    usage: { requests: 15420, limit: 100000 },
    apiKey: 'sk-xxx...xxx',
  },
  {
    id: '2',
    name: 'Slack',
    description: 'Send notifications and interact via Slack channels',
    icon: MessageSquare,
    category: 'communication',
    status: 'connected',
    lastSync: '5 min ago',
    usage: { messages: 1250, limit: 10000 },
  },
  {
    id: '3',
    name: 'Google Analytics',
    description: 'Track usage metrics and user behavior',
    icon: BarChart3,
    category: 'analytics',
    status: 'connected',
    lastSync: '1 hour ago',
    usage: { events: 45000, limit: 500000 },
  },
  {
    id: '4',
    name: 'GitHub',
    description: 'Integrate with repositories and actions',
    icon: GitBranch,
    category: 'devops',
    status: 'disconnected',
    lastSync: null,
    usage: null,
  },
  {
    id: '5',
    name: 'AWS S3',
    description: 'Store and retrieve files from S3 buckets',
    icon: Cloud,
    category: 'storage',
    status: 'connected',
    lastSync: '30 min ago',
    usage: { storage: 2.4, limit: 10 },
  },
  {
    id: '6',
    name: 'Gmail',
    description: 'Send emails and manage inbox via Gmail API',
    icon: Mail,
    category: 'communication',
    status: 'error',
    lastSync: '1 day ago',
    error: 'OAuth token expired',
    usage: null,
  },
  {
    id: '7',
    name: 'Anthropic Claude',
    description: 'Access Claude models for AI conversations',
    icon: Bot,
    category: 'ai',
    status: 'disconnected',
    lastSync: null,
    usage: null,
  },
  {
    id: '8',
    name: 'Google Calendar',
    description: 'Manage calendar events and schedules',
    icon: Calendar,
    category: 'communication',
    status: 'connected',
    lastSync: '15 min ago',
    usage: { events: 156, limit: 1000 },
  },
];

// API templates
const apiTemplates = [
  { id: '1', name: 'REST API', description: 'Generic REST API connector', icon: Globe },
  { id: '2', name: 'GraphQL', description: 'GraphQL endpoint connector', icon: Zap },
  { id: '3', name: 'Webhook', description: 'Incoming webhook receiver', icon: Link2 },
  { id: '4', name: 'OAuth2', description: 'OAuth2 authenticated API', icon: Shield },
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<typeof integrations[0] | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || integration.category === category;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Integrations', value: integrations.length, icon: Plug, color: 'text-primary' },
    { label: 'Connected', value: integrations.filter(i => i.status === 'connected').length, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Errors', value: integrations.filter(i => i.status === 'error').length, icon: XCircle, color: 'text-red-500' },
    { label: 'API Calls Today', value: '45.2K', icon: Activity, color: 'text-blue-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Error</Badge>;
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
              <Plug className="h-8 w-8 text-primary" />
              API Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect your agents to external services and APIs
            </p>
          </div>
          <Button onClick={() => setShowConnectDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Integration
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

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="templates">API Templates</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "hover:shadow-lg transition-all cursor-pointer group",
                      integration.status === 'connected' && "border-green-500/20",
                      integration.status === 'error' && "border-red-500/20"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                            integration.status === 'connected' && "bg-green-500/10",
                            integration.status === 'disconnected' && "bg-muted",
                            integration.status === 'error' && "bg-red-500/10"
                          )}>
                            <integration.icon className={cn(
                              "h-6 w-6",
                              integration.status === 'connected' && "text-green-500",
                              integration.status === 'disconnected' && "text-muted-foreground",
                              integration.status === 'error' && "text-red-500"
                            )} />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedIntegration(integration)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <TestTube className="h-4 w-4 mr-2" />
                                Test Connection
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync Now
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Unlink className="h-4 w-4 mr-2" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {getStatusBadge(integration.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {integration.description}
                          </p>
                        </div>

                        {integration.error && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-red-500">
                            <XCircle className="h-4 w-4" />
                            {integration.error}
                          </div>
                        )}

                        {integration.usage && integration.status === 'connected' && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Usage</span>
                              <span>
                                {typeof integration.usage === 'object' && 'requests' in integration.usage && integration.usage.requests !== undefined &&
                                  `${(integration.usage.requests / 1000).toFixed(1)}k / ${(integration.usage.limit / 1000).toFixed(0)}k`
                                }
                                {typeof integration.usage === 'object' && 'messages' in integration.usage && integration.usage.messages !== undefined &&
                                  `${integration.usage.messages.toLocaleString()} / ${integration.usage.limit.toLocaleString()}`
                                }
                                {typeof integration.usage === 'object' && 'events' in integration.usage && integration.usage.events !== undefined &&
                                  `${(integration.usage.events / 1000).toFixed(0)}k / ${(integration.usage.limit / 1000).toFixed(0)}k`
                                }
                                {typeof integration.usage === 'object' && 'storage' in integration.usage && integration.usage.storage !== undefined &&
                                  `${integration.usage.storage}GB / ${integration.usage.limit}GB`
                                }
                              </span>
                            </div>
                            <Progress 
                              value={
                                typeof integration.usage === 'object' && 'requests' in integration.usage && integration.usage.requests !== undefined
                                  ? (integration.usage.requests / integration.usage.limit) * 100
                                  : typeof integration.usage === 'object' && 'messages' in integration.usage && integration.usage.messages !== undefined
                                  ? (integration.usage.messages / integration.usage.limit) * 100
                                  : typeof integration.usage === 'object' && 'events' in integration.usage && integration.usage.events !== undefined
                                  ? (integration.usage.events / integration.usage.limit) * 100
                                  : typeof integration.usage === 'object' && 'storage' in integration.usage && integration.usage.storage !== undefined
                                  ? (integration.usage.storage / integration.usage.limit) * 100
                                  : 0
                              } 
                              className="h-1.5" 
                            />
                          </div>
                        )}

                        {integration.lastSync && (
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Last sync: {integration.lastSync}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        {integration.status === 'connected' ? (
                          <Button variant="outline" className="w-full gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Sync Now
                          </Button>
                        ) : integration.status === 'error' ? (
                          <Button className="w-full gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Reconnect
                          </Button>
                        ) : (
                          <Button className="w-full gap-2">
                            <Link2 className="h-4 w-4" />
                            Connect
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* API Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {apiTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
                    <CardContent className="p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4 transition-transform group-hover:scale-110">
                        <template.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>API calls and integration events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { integration: 'OpenAI', event: 'API call', status: 'success', time: '2 min ago', details: 'gpt-4 completion' },
                    { integration: 'Slack', event: 'Message sent', status: 'success', time: '5 min ago', details: '#general channel' },
                    { integration: 'AWS S3', event: 'File upload', status: 'success', time: '15 min ago', details: 'report.pdf (2.4MB)' },
                    { integration: 'Gmail', event: 'OAuth refresh', status: 'failed', time: '1 hour ago', details: 'Token expired' },
                    { integration: 'Google Analytics', event: 'Data sync', status: 'success', time: '2 hours ago', details: '15,234 events' },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{log.integration}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.event} • {log.details}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Integration Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Integration</DialogTitle>
              <DialogDescription>
                Connect a new service to your agent platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Integration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an integration" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.filter(i => i.status === 'disconnected').map(integration => (
                      <SelectItem key={integration.id} value={integration.id}>
                        <div className="flex items-center gap-2">
                          <integration.icon className="h-4 w-4" />
                          {integration.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Connection Name (optional)</Label>
                <Input id="name" placeholder="My API Connection" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
              <Button className="gap-2">
                <Link2 className="h-4 w-4" />
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configure Integration Dialog */}
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-xl">
            {selectedIntegration && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <selectedIntegration.icon className="h-5 w-5" />
                    {selectedIntegration.name} Settings
                  </DialogTitle>
                  <DialogDescription>
                    Configure your {selectedIntegration.name} integration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Connection Status</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedIntegration.lastSync ? `Last synced ${selectedIntegration.lastSync}` : 'Not connected'}
                      </p>
                    </div>
                    {getStatusBadge(selectedIntegration.status)}
                  </div>
                  {selectedIntegration.apiKey && (
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={selectedIntegration.apiKey}
                          readOnly
                          className="font-mono"
                        />
                        <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-sync</p>
                      <p className="text-sm text-muted-foreground">Automatically sync data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                    Close
                  </Button>
                  <Button>Save Changes</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
