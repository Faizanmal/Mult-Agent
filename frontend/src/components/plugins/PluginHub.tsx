'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plug,
  Package,
  Download,
  Star,
  Settings,
  Trash2,
  Plus,
  Search,
  Globe,
  User,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  usePlugins,
  useInstalledPlugins,
  usePublicPlugins,
  useInstallPlugin,
  useUninstallPlugin,
  useTogglePluginStatus,
  useCreatePlugin,
} from '@/hooks/usePlugins';

interface PluginType {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'agent_extension' | 'workflow_node' | 'integration' | 'tool' | 'custom';
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  author: {
    id: string;
    username: string;
  };
  repository_url?: string;
  documentation_url?: string;
  configuration_schema: Record<string, unknown>;
  permissions_required: string[];
  dependencies: string[];
  tags: string[];
  is_public: boolean;
  download_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}


const PluginHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('installed');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginType | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlugin, setNewPlugin] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    type: 'agent_extension' as 'agent_extension' | 'workflow_node' | 'integration' | 'tool' | 'custom',
    repository_url: '',
    documentation_url: '',
    tags: [] as string[],
    is_public: false,
  });
  const [newTag, setNewTag] = useState('');

  const { toast } = useToast();

  // Use our new hooks
  const { data: plugins = [], isLoading: isLoadingPlugins } = usePlugins();
  const { data: installedPlugins = [], isLoading: isLoadingInstalled } = useInstalledPlugins();
  const { data: publicPlugins = [], isLoading: isLoadingPublic } = usePublicPlugins();
  
  const { mutate: installPlugin } = useInstallPlugin();
  const { mutate: uninstallPlugin } = useUninstallPlugin();
  const { mutate: togglePluginStatus } = useTogglePluginStatus();
  const { mutate: createPlugin } = useCreatePlugin();

  const isLoading = isLoadingPlugins || isLoadingInstalled || isLoadingPublic;

  const addTag = () => {
    if (newTag.trim() && !newPlugin.tags.includes(newTag.trim())) {
      setNewPlugin({
        ...newPlugin,
        tags: [...newPlugin.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setNewPlugin({
      ...newPlugin,
      tags: newPlugin.tags.filter(t => t !== tag),
    });
  };

  const getTypeIcon = (type: PluginType['type']) => {
    switch (type) {
      case 'agent_extension': return <Plug className="h-4 w-4" />;
      case 'workflow_node': return <Package className="h-4 w-4" />;
      case 'integration': return <Globe className="h-4 w-4" />;
      case 'tool': return <Settings className="h-4 w-4" />;
      case 'custom': return <User className="h-4 w-4" />;
      default: return <Plug className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: PluginType['type']) => {
    switch (type) {
      case 'agent_extension': return 'bg-blue-100 text-blue-800';
      case 'workflow_node': return 'bg-purple-100 text-purple-800';
      case 'integration': return 'bg-green-100 text-green-800';
      case 'tool': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: PluginType['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || plugin.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const filteredInstalledPlugins = installedPlugins.filter(installation => {
    const plugin = installation.plugin;
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || plugin.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const filteredPublicPlugins = publicPlugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || plugin.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleCreatePlugin = () => {
    // In a real implementation, this would call your API
    fetch('/api/agents/plugins/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPlugin),
    })
      .then(response => response.json())
      .then(data => {
        toast({
          title: 'Plugin Created',
          description: `${newPlugin.name} has been created successfully`,
        });
        setNewPlugin({
          name: '',
          description: '',
          version: '1.0.0',
          type: 'agent_extension',
          repository_url: '',
          documentation_url: '',
          tags: [],
          is_public: false,
        });
        setShowCreateForm(false);
      })
      .catch(error => {
        toast({
          title: 'Error',
          description: 'Failed to create plugin',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Hub</h1>
          <p className="text-muted-foreground">
            Extend your multi-agent system with powerful plugins
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plugin
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="agent_extension">Agent Extensions</SelectItem>
            <SelectItem value="workflow_node">Workflow Nodes</SelectItem>
            <SelectItem value="integration">Integrations</SelectItem>
            <SelectItem value="tool">Tools</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="my-plugins">My Plugins</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInstalledPlugins.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Installed Plugins</h3>
                <p className="text-muted-foreground mb-4">
                  You haven{`'`}t installed any plugins yet. Browse the marketplace to find useful plugins.
                </p>
                <Button onClick={() => setActiveTab('marketplace')}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstalledPlugins.map((installation) => (
                <Card key={installation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(installation.plugin.type)}
                        <CardTitle className="text-lg">{installation.plugin.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(installation.plugin.status)}>
                        {installation.plugin.status}
                      </Badge>
                    </div>
                    <CardDescription>{installation.plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {installation.plugin.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{installation.plugin.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({installation.plugin.rating_count})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={installation.is_active}
                          onCheckedChange={() => togglePluginStatus(installation.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => uninstallPlugin(installation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-plugins" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPlugins.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plugins Created</h3>
                <p className="text-muted-foreground mb-4">
                  You haven{`'`}t created any plugins yet. Start by creating your first plugin.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Plugin
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlugins.map((plugin) => (
                <Card key={plugin.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(plugin.type)}
                        <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(plugin.status)}>
                        {plugin.status}
                      </Badge>
                    </div>
                    <CardDescription>{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plugin.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{plugin.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({plugin.rating_count})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          v{plugin.version}
                        </span>
                        {plugin.is_public ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPublicPlugins.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plugins Found</h3>
                <p className="text-muted-foreground">
                  No plugins match your search criteria. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPublicPlugins.map((plugin) => (
                <Card key={plugin.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(plugin.type)}
                        <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      </div>
                      <Badge className={getTypeColor(plugin.type)}>
                        {plugin.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plugin.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{plugin.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({plugin.rating_count})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {plugin.download_count} downloads
                        </span>
                        <Button
                          size="sm"
                          onClick={() => installPlugin(plugin.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Install
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Plugin Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Plugin</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                Create a new plugin to extend your multi-agent system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plugin Name</Label>
                <Input
                  id="name"
                  value={newPlugin.name}
                  onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                  placeholder="Enter plugin name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlugin.description}
                  onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })}
                  placeholder="Describe what your plugin does"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={newPlugin.version}
                    onChange={(e) => setNewPlugin({ ...newPlugin, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Plugin Type</Label>
                  <Select
                    value={newPlugin.type}
                    onValueChange={(value) => setNewPlugin({ ...newPlugin, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent_extension">Agent Extension</SelectItem>
                      <SelectItem value="workflow_node">Workflow Node</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repository">Repository URL (Optional)</Label>
                  <Input
                    id="repository"
                    value={newPlugin.repository_url}
                    onChange={(e) => setNewPlugin({ ...newPlugin, repository_url: e.target.value })}
                    placeholder="https://github.com/username/plugin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentation">Documentation URL (Optional)</Label>
                  <Input
                    id="documentation"
                    value={newPlugin.documentation_url}
                    onChange={(e) => setNewPlugin({ ...newPlugin, documentation_url: e.target.value })}
                    placeholder="https://docs.example.com/plugin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag();
                      }
                    }}
                  />
                  <Button onClick={addTag} type="button">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPlugin.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full hover:bg-muted-foreground/20 p-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="public"
                    checked={newPlugin.is_public}
                    onCheckedChange={(checked) => setNewPlugin({ ...newPlugin, is_public: checked })}
                  />
                  <Label htmlFor="public">Make Public</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlugin}>
                    Create Plugin
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PluginHub;