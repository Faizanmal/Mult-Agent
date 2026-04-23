"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Webhook,
  Plus,
  Search,
  MoreVertical,
  Copy,
  Trash2,
  Settings,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  RefreshCw,
  Zap,
  Globe,
  Eye,
  EyeOff,
  RotateCcw,
  Send,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Webhook endpoints
const webhooks = [
  {
    id: '1',
    name: 'Agent Completion',
    url: 'https://api.myapp.com/webhooks/agent-complete',
    events: ['agent.completed', 'agent.failed'],
    status: 'active',
    lastTriggered: '2 min ago',
    successRate: 98.5,
    totalDeliveries: 1250,
  },
  {
    id: '2',
    name: 'Workflow Events',
    url: 'https://hooks.slack.com/services/xxx',
    events: ['workflow.started', 'workflow.completed'],
    status: 'active',
    lastTriggered: '15 min ago',
    successRate: 100,
    totalDeliveries: 856,
  },
  {
    id: '3',
    name: 'Error Notifications',
    url: 'https://api.pagerduty.com/webhooks/xxx',
    events: ['agent.error', 'system.error'],
    status: 'active',
    lastTriggered: '1 hour ago',
    successRate: 99.2,
    totalDeliveries: 324,
  },
  {
    id: '4',
    name: 'Analytics Export',
    url: 'https://analytics.mycompany.com/ingest',
    events: ['analytics.daily'],
    status: 'paused',
    lastTriggered: '2 days ago',
    successRate: 95.0,
    totalDeliveries: 62,
  },
];

// Delivery logs
const deliveryLogs = [
  { id: '1', webhook: 'Agent Completion', event: 'agent.completed', status: 'success', statusCode: 200, timestamp: '2024-01-15 14:32:15', duration: '145ms' },
  { id: '2', webhook: 'Workflow Events', event: 'workflow.started', status: 'success', statusCode: 200, timestamp: '2024-01-15 14:30:22', duration: '98ms' },
  { id: '3', webhook: 'Agent Completion', event: 'agent.failed', status: 'success', statusCode: 200, timestamp: '2024-01-15 14:28:45', duration: '156ms' },
  { id: '4', webhook: 'Error Notifications', event: 'agent.error', status: 'failed', statusCode: 500, timestamp: '2024-01-15 14:25:10', duration: '2045ms' },
  { id: '5', webhook: 'Agent Completion', event: 'agent.completed', status: 'success', statusCode: 200, timestamp: '2024-01-15 14:22:33', duration: '112ms' },
  { id: '6', webhook: 'Workflow Events', event: 'workflow.completed', status: 'success', statusCode: 200, timestamp: '2024-01-15 14:20:18', duration: '87ms' },
];

// Available events
const availableEvents = [
  { category: 'Agent', events: ['agent.created', 'agent.started', 'agent.completed', 'agent.failed', 'agent.error'] },
  { category: 'Workflow', events: ['workflow.created', 'workflow.started', 'workflow.completed', 'workflow.failed'] },
  { category: 'System', events: ['system.error', 'system.warning', 'system.info'] },
  { category: 'Analytics', events: ['analytics.daily', 'analytics.weekly', 'analytics.monthly'] },
];

export default function WebhooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<typeof webhooks[0] | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const stats = [
    { label: 'Total Webhooks', value: webhooks.length, icon: Webhook, color: 'text-primary' },
    { label: 'Active', value: webhooks.filter(w => w.status === 'active').length, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Total Deliveries', value: '2.5K', icon: Send, color: 'text-blue-500' },
    { label: 'Success Rate', value: '98.2%', icon: Activity, color: 'text-purple-500' },
  ];

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
              <Webhook className="h-8 w-8 text-primary" />
              Webhooks
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage webhook endpoints and event subscriptions
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Webhook
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

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="deliveries">Delivery Logs</TabsTrigger>
            <TabsTrigger value="events">Event Types</TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search webhooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {webhooks.map((webhook, index) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                          webhook.status === 'active' ? "bg-green-500/10" : "bg-muted"
                        )}>
                          <Webhook className={cn(
                            "h-6 w-6",
                            webhook.status === 'active' ? "text-green-500" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{webhook.name}</h3>
                            <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                              {webhook.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Globe className="h-3 w-3" />
                            <code className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-md">
                              {webhook.url}
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map(event => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Last triggered: {webhook.lastTriggered}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {webhook.totalDeliveries} deliveries
                            </span>
                            <span className={cn(
                              "font-medium",
                              webhook.successRate >= 98 ? "text-green-500" : "text-yellow-500"
                            )}>
                              {webhook.successRate}% success
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedWebhook(webhook)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Send Test
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {webhook.status === 'active' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Delivery Logs Tab */}
          <TabsContent value="deliveries" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{log.webhook}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{log.event}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.statusCode === 200 ? 'default' : 'destructive'}>
                          {log.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.duration}</TableCell>
                      <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Event Types Tab */}
          <TabsContent value="events" className="space-y-6">
            {availableEvents.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category} Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.events.map(event => (
                      <Badge key={event} variant="secondary" className="py-1.5 px-3">
                        <Zap className="h-3 w-3 mr-2" />
                        {event}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Create Webhook Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Configure a new webhook endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="My Webhook" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input id="url" placeholder="https://api.example.com/webhooks" />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select events" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvents.flatMap(cat => cat.events).map(event => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret">Secret (optional)</Label>
                <div className="relative">
                  <Input
                    id="secret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="whsec_..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configure Webhook Dialog */}
        <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
          <DialogContent className="max-w-xl">
            {selectedWebhook && (
              <>
                <DialogHeader>
                  <DialogTitle>Configure Webhook</DialogTitle>
                  <DialogDescription>
                    Update settings for {selectedWebhook.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input defaultValue={selectedWebhook.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <Input defaultValue={selectedWebhook.url} />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscribed Events</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedWebhook.events.map(event => (
                        <Badge key={event} variant="secondary" className="gap-1">
                          {event}
                          <XCircle className="h-3 w-3 cursor-pointer" />
                        </Badge>
                      ))}
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Webhook</p>
                      <p className="text-sm text-muted-foreground">Receive event notifications</p>
                    </div>
                    <Switch defaultChecked={selectedWebhook.status === 'active'} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedWebhook(null)}>
                    Cancel
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
