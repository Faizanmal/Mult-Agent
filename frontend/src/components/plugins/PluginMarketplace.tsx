'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Star,
  Globe,
  User,
  Package,
  Plug,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const PluginMarketplace: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginType[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginType | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    filterAndSortPlugins();
  }, [plugins, searchTerm, typeFilter, sortOption]);

  const loadPlugins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agents/plugins/list_public/');
      const data = await response.json();
      setPlugins(data.results);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      toast({
        title: 'Error',
        description: 'Failed to load plugins from marketplace',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPlugins = () => {
    let result = [...plugins];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(plugin => 
        plugin.name.toLowerCase().includes(term) ||
        plugin.description.toLowerCase().includes(term) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(plugin => plugin.type === typeFilter);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'popular':
        result.sort((a, b) => b.download_count - a.download_count);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'updated':
        result.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
      default:
        break;
    }
    
    setFilteredPlugins(result);
  };

  const installPlugin = async (plugin: PluginType) => {
    try {
      // In a real implementation, this would call your API
      // const response = await fetch(`/api/agents/plugins/${plugin.id}/install/`, {
      //   method: 'POST',
      // });
      
      toast({
        title: 'Plugin Installed',
        description: `${plugin.name} has been installed successfully`,
      });
    } catch (error) {
      console.error('Failed to install plugin:', error);
      toast({
        title: 'Error',
        description: 'Failed to install plugin',
        variant: 'destructive',
      });
    }
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

  return (
    <div className="space-y-6">
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
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
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
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Most Popular
                </div>
              </SelectItem>
              <SelectItem value="rating">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Highest Rated
                </div>
              </SelectItem>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Newest
                </div>
              </SelectItem>
              <SelectItem value="updated">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Recently Updated
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredPlugins.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Plugins Found</h3>
            <p className="text-muted-foreground">
              No plugins match your search criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <Card 
              key={plugin.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPlugin(plugin)}
            >
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
                <CardDescription className="line-clamp-2">
                  {plugin.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {plugin.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {plugin.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{plugin.tags.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{plugin.rating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({plugin.rating_count})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {plugin.download_count.toLocaleString()} downloads
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        installPlugin(plugin);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <span>by {plugin.author.username}</span>
                  <span>v{plugin.version}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Plugin Detail Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedPlugin.type)}
                  <div>
                    <CardTitle className="text-2xl">{selectedPlugin.name}</CardTitle>
                    <CardDescription>{selectedPlugin.description}</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedPlugin(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Badge className={getTypeColor(selectedPlugin.type)}>
                  {selectedPlugin.type.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{selectedPlugin.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({selectedPlugin.rating_count} reviews)
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  v{selectedPlugin.version}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Globe className="h-4 w-4" />
                  Public
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Plugin Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Author</Label>
                      <p className="font-medium">{selectedPlugin.author.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Downloads</Label>
                      <p className="font-medium">{selectedPlugin.download_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Published</Label>
                      <p className="font-medium">
                        {new Date(selectedPlugin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Last Updated</Label>
                      <p className="font-medium">
                        {new Date(selectedPlugin.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlugin.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold mt-4 mb-3">Dependencies</h3>
                  {selectedPlugin.dependencies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedPlugin.dependencies.map((dep, index) => (
                        <Badge key={index} variant="outline">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No dependencies</p>
                  )}
                </div>
              </div>
              
              {/* Plugin Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={() => installPlugin(selectedPlugin)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Plugin
                </Button>
                
                {selectedPlugin.repository_url && (
                  <Button variant="outline" asChild>
                    <a href={selectedPlugin.repository_url} target="_blank" rel="noopener noreferrer">
                      Repository
                    </a>
                  </Button>
                )}
                
                {selectedPlugin.documentation_url && (
                  <Button variant="outline" asChild>
                    <a href={selectedPlugin.documentation_url} target="_blank" rel="noopener noreferrer">
                      Documentation
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PluginMarketplace;