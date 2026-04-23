"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Puzzle,
  Search,
  Grid3X3,
  List,
  Star,
  Download,
  Settings,
  Trash2,
  CheckCircle2,
  Shield,
  Database,
  MessageSquare,
  BarChart3,
  Globe,
  GitBranch,
  Bot,
  Image,
  Mail,
  Sparkles,
  Filter,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Plugin categories
const categories = [
  { id: 'all', label: 'All Plugins', icon: Grid3X3 },
  { id: 'ai', label: 'AI & ML', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
];

// Sample plugins data
const plugins = [
  {
    id: '1',
    name: 'OpenAI Integration',
    description: 'Seamless integration with OpenAI GPT models for advanced language processing.',
    icon: Bot,
    category: 'ai',
    rating: 4.9,
    downloads: 125000,
    installed: true,
    enabled: true,
    verified: true,
    author: 'Official',
    version: '2.1.0',
    tags: ['gpt-4', 'embeddings', 'chat'],
  },
  {
    id: '2',
    name: 'Slack Connector',
    description: 'Connect your agents to Slack workspaces for seamless team communication.',
    icon: MessageSquare,
    category: 'communication',
    rating: 4.7,
    downloads: 89000,
    installed: true,
    enabled: true,
    verified: true,
    author: 'Official',
    version: '1.8.2',
    tags: ['notifications', 'chat', 'webhooks'],
  },
  {
    id: '3',
    name: 'Advanced Analytics',
    description: 'Deep analytics and insights for your agent performance and usage patterns.',
    icon: BarChart3,
    category: 'analytics',
    rating: 4.8,
    downloads: 67000,
    installed: true,
    enabled: false,
    verified: true,
    author: 'Analytics Pro',
    version: '3.0.1',
    tags: ['metrics', 'dashboards', 'reports'],
  },
  {
    id: '4',
    name: 'GitHub Actions',
    description: 'Trigger and manage GitHub workflows directly from your agent pipelines.',
    icon: GitBranch,
    category: 'integrations',
    rating: 4.6,
    downloads: 54000,
    installed: false,
    enabled: false,
    verified: true,
    author: 'DevOps Hub',
    version: '2.3.0',
    tags: ['ci/cd', 'automation', 'github'],
  },
  {
    id: '5',
    name: 'Security Shield',
    description: 'Advanced security monitoring and threat detection for your agent infrastructure.',
    icon: Shield,
    category: 'security',
    rating: 4.9,
    downloads: 45000,
    installed: false,
    enabled: false,
    verified: true,
    author: 'SecureTech',
    version: '1.5.0',
    tags: ['monitoring', 'threats', 'compliance'],
  },
  {
    id: '6',
    name: 'Vector Database',
    description: 'High-performance vector storage for embeddings and semantic search.',
    icon: Database,
    category: 'data',
    rating: 4.7,
    downloads: 38000,
    installed: false,
    enabled: false,
    verified: false,
    author: 'DataCore',
    version: '1.2.0',
    tags: ['vectors', 'search', 'embeddings'],
  },
  {
    id: '7',
    name: 'Image Recognition',
    description: 'Add vision capabilities to your agents with state-of-the-art image recognition.',
    icon: Image,
    category: 'ai',
    rating: 4.5,
    downloads: 32000,
    installed: false,
    enabled: false,
    verified: true,
    author: 'VisionAI',
    version: '2.0.0',
    tags: ['vision', 'ocr', 'detection'],
  },
  {
    id: '8',
    name: 'Email Automation',
    description: 'Automate email workflows and integrate with major email providers.',
    icon: Mail,
    category: 'communication',
    rating: 4.4,
    downloads: 28000,
    installed: false,
    enabled: false,
    verified: true,
    author: 'MailFlow',
    version: '1.9.0',
    tags: ['smtp', 'templates', 'automation'],
  },
];

export default function PluginsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPlugin, setSelectedPlugin] = useState<typeof plugins[0] | null>(null);
  const [installedPlugins, setInstalledPlugins] = useState(
    plugins.filter(p => p.installed).map(p => p.id)
  );
  const [enabledPlugins, setEnabledPlugins] = useState(
    plugins.filter(p => p.enabled).map(p => p.id)
  );

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || plugin.category === category;
    return matchesSearch && matchesCategory;
  });

  const toggleInstall = (pluginId: string) => {
    if (installedPlugins.includes(pluginId)) {
      setInstalledPlugins(installedPlugins.filter(id => id !== pluginId));
      setEnabledPlugins(enabledPlugins.filter(id => id !== pluginId));
    } else {
      setInstalledPlugins([...installedPlugins, pluginId]);
    }
  };

  const toggleEnabled = (pluginId: string) => {
    if (enabledPlugins.includes(pluginId)) {
      setEnabledPlugins(enabledPlugins.filter(id => id !== pluginId));
    } else {
      setEnabledPlugins([...enabledPlugins, pluginId]);
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
              <Puzzle className="h-8 w-8 text-primary" />
              Plugin Marketplace
            </h1>
            <p className="text-muted-foreground mt-1">
              Extend your agents with powerful plugins
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Download className="h-3 w-3" />
              {installedPlugins.length} Installed
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="installed">Installed ({installedPlugins.length})</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
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
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Featured Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Featured Plugins</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {plugins.slice(0, 3).map((plugin) => (
                  <div
                    key={plugin.id}
                    className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedPlugin(plugin)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <plugin.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{plugin.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {plugin.rating}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{plugin.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plugin Grid/List */}
            <div className={cn(
              viewMode === 'grid'
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            )}>
              <AnimatePresence mode="popLayout">
                {filteredPlugins.map((plugin, index) => (
                  <motion.div
                    key={plugin.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
                        viewMode === 'list' && "flex"
                      )}
                      onClick={() => setSelectedPlugin(plugin)}
                    >
                      <CardContent className={cn(
                        "p-4",
                        viewMode === 'list' && "flex items-center gap-4 flex-1"
                      )}>
                        <div className={cn(
                          "flex items-start gap-3",
                          viewMode === 'list' && "flex-1"
                        )}>
                          <div className={cn(
                            "flex items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110",
                            viewMode === 'grid' ? "h-12 w-12" : "h-10 w-10",
                            plugin.category === 'ai' && "from-purple-500/20 to-pink-500/20",
                            plugin.category === 'integrations' && "from-blue-500/20 to-cyan-500/20",
                            plugin.category === 'analytics' && "from-green-500/20 to-emerald-500/20",
                            plugin.category === 'security' && "from-red-500/20 to-orange-500/20",
                            plugin.category === 'data' && "from-yellow-500/20 to-amber-500/20",
                            plugin.category === 'communication' && "from-indigo-500/20 to-violet-500/20",
                          )}>
                            <plugin.icon className={cn(
                              "text-primary",
                              viewMode === 'grid' ? "h-6 w-6" : "h-5 w-5"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">{plugin.name}</p>
                              {plugin.verified && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                              )}
                            </div>
                            <p className={cn(
                              "text-sm text-muted-foreground",
                              viewMode === 'grid' ? "line-clamp-2 mt-1" : "line-clamp-1"
                            )}>
                              {plugin.description}
                            </p>
                            {viewMode === 'grid' && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {plugin.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={cn(
                          "flex items-center justify-between",
                          viewMode === 'grid' ? "mt-4" : "gap-4"
                        )}>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {plugin.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {(plugin.downloads / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant={installedPlugins.includes(plugin.id) ? "secondary" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleInstall(plugin.id);
                            }}
                          >
                            {installedPlugins.includes(plugin.id) ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Installed
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="installed" className="space-y-6">
            <div className="grid gap-4">
              {plugins.filter(p => installedPlugins.includes(p.id)).map((plugin) => (
                <Card key={plugin.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <plugin.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{plugin.name}</p>
                        <Badge variant="outline" className="text-xs">v{plugin.version}</Badge>
                        {plugin.verified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plugin.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Enabled</span>
                        <Switch
                          checked={enabledPlugins.includes(plugin.id)}
                          onCheckedChange={() => toggleEnabled(plugin.id)}
                        />
                      </div>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => toggleInstall(plugin.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {installedPlugins.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Puzzle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold">No plugins installed</h3>
                  <p className="text-sm text-muted-foreground">Browse the marketplace to find plugins</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="font-semibold">All plugins are up to date</h3>
                <p className="text-sm text-muted-foreground">Your installed plugins are running the latest versions</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Plugin Detail Dialog */}
        <Dialog open={!!selectedPlugin} onOpenChange={() => setSelectedPlugin(null)}>
          <DialogContent className="max-w-2xl">
            {selectedPlugin && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <selectedPlugin.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="flex items-center gap-2">
                        {selectedPlugin.name}
                        {selectedPlugin.verified && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </DialogTitle>
                      <DialogDescription>By {selectedPlugin.author}</DialogDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {selectedPlugin.rating}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Download className="h-4 w-4" />
                          {selectedPlugin.downloads.toLocaleString()} downloads
                        </span>
                        <Badge variant="outline">v{selectedPlugin.version}</Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                <Separator />
                <div className="space-y-4">
                  <p className="text-muted-foreground">{selectedPlugin.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedPlugin(null)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    toggleInstall(selectedPlugin.id);
                    setSelectedPlugin(null);
                  }}>
                    {installedPlugins.includes(selectedPlugin.id) ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Uninstall
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </>
                    )}
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
