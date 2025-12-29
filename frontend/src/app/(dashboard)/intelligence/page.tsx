"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Zap,
  Activity,
  Bot,
  Sparkles,
  Target,
  Layers,
  GitCompare,
  BarChart3,
  TrendingUp,
  MessageSquare,
  FileText,
  Code,
  Image,
  Mic,
  Video,
  Globe,
  Shield,
  Scale,
  Gauge,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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

// Available AI models
const models = [
  {
    id: '1',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    type: 'text',
    status: 'active',
    latency: '1.2s',
    cost: '$0.03/1K',
    capabilities: ['reasoning', 'coding', 'analysis', 'creativity'],
    quality: 98,
    speed: 85,
    icon: MessageSquare,
  },
  {
    id: '2',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    type: 'text',
    status: 'active',
    latency: '1.5s',
    cost: '$0.015/1K',
    capabilities: ['reasoning', 'analysis', 'writing', 'safety'],
    quality: 97,
    speed: 80,
    icon: Brain,
  },
  {
    id: '3',
    name: 'Gemini Pro',
    provider: 'Google',
    type: 'multimodal',
    status: 'active',
    latency: '0.8s',
    cost: '$0.001/1K',
    capabilities: ['vision', 'reasoning', 'coding', 'multimodal'],
    quality: 92,
    speed: 95,
    icon: Sparkles,
  },
  {
    id: '4',
    name: 'Mixtral 8x7B',
    provider: 'Mistral',
    type: 'text',
    status: 'active',
    latency: '0.5s',
    cost: '$0.0005/1K',
    capabilities: ['coding', 'reasoning', 'fast'],
    quality: 88,
    speed: 98,
    icon: Zap,
  },
  {
    id: '5',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'image',
    status: 'active',
    latency: '8s',
    cost: '$0.04/image',
    capabilities: ['generation', 'editing', 'variations'],
    quality: 95,
    speed: 60,
    icon: Image,
  },
  {
    id: '6',
    name: 'Whisper',
    provider: 'OpenAI',
    type: 'audio',
    status: 'active',
    latency: '2s',
    cost: '$0.006/min',
    capabilities: ['transcription', 'translation', 'multilingual'],
    quality: 96,
    speed: 90,
    icon: Mic,
  },
];

// Model routing rules
const routingRules = [
  { id: '1', name: 'Complex Reasoning', condition: 'Task requires deep analysis', model: 'GPT-4 Turbo', fallback: 'Claude 3 Opus' },
  { id: '2', name: 'Fast Response', condition: 'Latency < 1s required', model: 'Mixtral 8x7B', fallback: 'Gemini Pro' },
  { id: '3', name: 'Vision Tasks', condition: 'Input contains images', model: 'Gemini Pro', fallback: 'GPT-4 Vision' },
  { id: '4', name: 'Cost Optimization', condition: 'Non-critical tasks', model: 'Mixtral 8x7B', fallback: 'Claude Haiku' },
];

// Intelligence benchmarks
const benchmarks = [
  { name: 'Reasoning', scores: { 'GPT-4 Turbo': 95, 'Claude 3 Opus': 94, 'Gemini Pro': 88, 'Mixtral 8x7B': 82 } },
  { name: 'Coding', scores: { 'GPT-4 Turbo': 92, 'Claude 3 Opus': 88, 'Gemini Pro': 85, 'Mixtral 8x7B': 90 } },
  { name: 'Speed', scores: { 'GPT-4 Turbo': 75, 'Claude 3 Opus': 70, 'Gemini Pro': 95, 'Mixtral 8x7B': 98 } },
  { name: 'Cost Efficiency', scores: { 'GPT-4 Turbo': 60, 'Claude 3 Opus': 75, 'Gemini Pro': 95, 'Mixtral 8x7B': 98 } },
];

export default function IntelligencePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModelDialog, setShowAddModelDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<typeof models[0] | null>(null);

  const stats = [
    { label: 'Active Models', value: models.filter(m => m.status === 'active').length, icon: Brain, color: 'text-primary' },
    { label: 'Avg Latency', value: '1.2s', icon: Clock, color: 'text-blue-500' },
    { label: 'Requests/min', value: '2.4K', icon: Activity, color: 'text-green-500' },
    { label: 'Cost Today', value: '$45.20', icon: TrendingUp, color: 'text-yellow-500' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500/10 text-blue-500';
      case 'multimodal': return 'bg-purple-500/10 text-purple-500';
      case 'image': return 'bg-pink-500/10 text-pink-500';
      case 'audio': return 'bg-green-500/10 text-green-500';
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
              <Brain className="h-8 w-8 text-primary" />
              Multi-Model Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and orchestrate multiple AI models for optimal performance
            </p>
          </div>
          <Button onClick={() => setShowAddModelDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Model
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

        <Tabs defaultValue="models" className="space-y-6">
          <TabsList>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="routing">Model Routing</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all group cursor-pointer hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                          <model.icon className="h-6 w-6 text-primary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedModel(model)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Metrics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{model.name}</h3>
                          <Badge variant="outline" className={getTypeColor(model.type)}>
                            {model.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{model.provider}</p>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {model.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            Quality
                          </span>
                          <span className="font-medium">{model.quality}%</span>
                        </div>
                        <Progress value={model.quality} className="h-1.5" />

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Speed
                          </span>
                          <span className="font-medium">{model.speed}%</span>
                        </div>
                        <Progress value={model.speed} className="h-1.5" />
                      </div>

                      <div className="flex justify-between mt-4 pt-4 border-t text-sm">
                        <div>
                          <p className="text-muted-foreground">Latency</p>
                          <p className="font-medium">{model.latency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">{model.cost}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Model Routing Tab */}
          <TabsContent value="routing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Intelligent Model Routing</CardTitle>
                    <CardDescription>
                      Automatically route requests to the optimal model based on task requirements
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {routingRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GitCompare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.condition}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{rule.model}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="secondary">{rule.fallback}</Badge>
                    </div>
                    <Switch defaultChecked />
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Load Balancing</CardTitle>
                <CardDescription>Distribute requests across models for optimal performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Enable Auto Load Balancing</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically distribute load across available models
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Fallback on Failure</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically switch to backup model on errors
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Cost-Based Routing</p>
                      <p className="text-sm text-muted-foreground">
                        Prefer cost-efficient models for non-critical tasks
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
                <CardDescription>Compare capabilities across different AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {benchmarks.map((benchmark) => (
                    <div key={benchmark.name} className="space-y-3">
                      <h4 className="font-medium">{benchmark.name}</h4>
                      <div className="space-y-2">
                        {Object.entries(benchmark.scores).map(([model, score]) => (
                          <div key={model} className="flex items-center gap-4">
                            <span className="w-32 text-sm text-muted-foreground truncate">{model}</span>
                            <div className="flex-1">
                              <Progress value={score} className="h-2" />
                            </div>
                            <span className="w-12 text-sm font-medium text-right">{score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Quality Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure settings to prioritize response quality
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Use best available model</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable retry on low confidence</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cross-validate with multiple models</span>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Speed Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure settings to prioritize response speed
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Use fastest model by default</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enable response streaming</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cache frequent queries</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-green-500" />
                    Cost Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure settings to minimize costs
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prefer cost-efficient models</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Set daily budget limit</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compress long inputs</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Safety & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure safety and compliance settings
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content filtering</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">PII detection & redaction</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Audit logging</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Model Dialog */}
        <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add AI Model</DialogTitle>
              <DialogDescription>
                Connect a new AI model to your multi-model intelligence system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="custom">Custom/Self-hosted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                    <SelectItem value="gemini">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" type="password" placeholder="sk-..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alias">Model Alias (optional)</Label>
                <Input id="alias" placeholder="My GPT-4 Instance" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModelDialog(false)}>
                Cancel
              </Button>
              <Button>Add Model</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
