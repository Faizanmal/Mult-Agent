"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Search,
  Plus,
  Play,
  Settings,
  Code2,
  Terminal,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  Zap,
  Database,
  Globe,
  FileCode,
  Layers,
  RefreshCw,
  MoreVertical,
  Trash2,
  Star,
  StarOff,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// MCP Tools data
const mcpTools = [
  {
    id: '1',
    name: 'File System Operations',
    description: 'Read, write, and manage files and directories',
    category: 'filesystem',
    icon: FileCode,
    color: 'bg-blue-500',
    operations: ['read_file', 'write_file', 'list_directory', 'create_directory', 'delete_file'],
    isInstalled: true,
    isFavorite: true,
    lastUsed: '2 min ago',
    usageCount: 1284,
  },
  {
    id: '2',
    name: 'Database Connector',
    description: 'Execute queries on PostgreSQL, MySQL, and MongoDB',
    category: 'database',
    icon: Database,
    color: 'bg-green-500',
    operations: ['execute_query', 'insert_record', 'update_record', 'delete_record', 'list_tables'],
    isInstalled: true,
    isFavorite: false,
    lastUsed: '15 min ago',
    usageCount: 856,
  },
  {
    id: '3',
    name: 'HTTP Client',
    description: 'Make HTTP requests to external APIs',
    category: 'network',
    icon: Globe,
    color: 'bg-purple-500',
    operations: ['get', 'post', 'put', 'delete', 'patch'],
    isInstalled: true,
    isFavorite: true,
    lastUsed: '5 min ago',
    usageCount: 2341,
  },
  {
    id: '4',
    name: 'Code Executor',
    description: 'Execute Python, JavaScript, and shell scripts',
    category: 'execution',
    icon: Terminal,
    color: 'bg-orange-500',
    operations: ['run_python', 'run_javascript', 'run_shell', 'run_script'],
    isInstalled: true,
    isFavorite: false,
    lastUsed: '1 hour ago',
    usageCount: 567,
  },
  {
    id: '5',
    name: 'Data Transform',
    description: 'Transform and manipulate data structures',
    category: 'data',
    icon: Layers,
    color: 'bg-cyan-500',
    operations: ['json_to_csv', 'csv_to_json', 'filter_data', 'map_data', 'aggregate'],
    isInstalled: false,
    isFavorite: false,
    lastUsed: null,
    usageCount: 0,
  },
  {
    id: '6',
    name: 'AI Model Connector',
    description: 'Connect to various AI models and services',
    category: 'ai',
    icon: Sparkles,
    color: 'bg-pink-500',
    operations: ['generate_text', 'generate_image', 'embed_text', 'classify'],
    isInstalled: true,
    isFavorite: true,
    lastUsed: '30 sec ago',
    usageCount: 4521,
  },
];

// Execution history
const executionHistory = [
  {
    id: '1',
    tool: 'HTTP Client',
    operation: 'POST',
    status: 'success',
    duration: '245ms',
    timestamp: '2 min ago',
    input: { url: 'https://api.example.com/users', method: 'POST' },
    output: { status: 200, body: { id: 123, name: 'John' } },
  },
  {
    id: '2',
    tool: 'File System Operations',
    operation: 'read_file',
    status: 'success',
    duration: '12ms',
    timestamp: '5 min ago',
    input: { path: '/data/config.json' },
    output: { content: '{"key": "value"}' },
  },
  {
    id: '3',
    tool: 'Database Connector',
    operation: 'execute_query',
    status: 'error',
    duration: '1.2s',
    timestamp: '10 min ago',
    input: { query: 'SELECT * FROM users' },
    output: { error: 'Connection timeout' },
  },
  {
    id: '4',
    tool: 'AI Model Connector',
    operation: 'generate_text',
    status: 'success',
    duration: '890ms',
    timestamp: '15 min ago',
    input: { prompt: 'Summarize...' },
    output: { text: 'Summary generated successfully' },
  },
];

export default function MCPPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ , setSelectedTool] = useState<typeof mcpTools[0] | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ success: boolean; output: { message: string; data: Record<string, unknown> }; duration: string } | null>(null);

  const categories = ['all', 'filesystem', 'database', 'network', 'execution', 'data', 'ai'];

  const filteredTools = mcpTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setExecutionResult({
      success: true,
      output: { message: 'Operation completed successfully', data: { key: 'value' } },
      duration: '234ms',
    });
    setIsExecuting(false);
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
              <Cpu className="h-8 w-8 text-primary" />
              MCP Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              Model Context Protocol tools for extended capabilities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Tools
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90">
              <Plus className="h-4 w-4" />
              Register Tool
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Tools', value: mcpTools.length, icon: Cpu, color: 'text-indigo-500' },
            { label: 'Installed', value: mcpTools.filter(t => t.isInstalled).length, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Executions Today', value: '8,456', icon: Zap, color: 'text-orange-500' },
            { label: 'Avg Response', value: '124ms', icon: Clock, color: 'text-blue-500' },
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

        {/* Main Content */}
        <Tabs defaultValue="tools" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tools" className="gap-2">
              <Cpu className="h-4 w-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="execute" className="gap-2">
              <Play className="h-4 w-4" />
              Execute
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tools..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tools Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className={cn("h-1.5", tool.color)} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tool.color)}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {tool.name}
                                {tool.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                              </CardTitle>
                              <Badge variant="secondary" className="text-xs capitalize mt-1">
                                {tool.category}
                              </Badge>
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
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Code2 className="h-4 w-4 mr-2" />
                                View Schema
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {tool.isFavorite ? (
                                  <>
                                    <StarOff className="h-4 w-4 mr-2" />
                                    Remove from Favorites
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Add to Favorites
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Uninstall
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                        
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
                              <span>{tool.operations.length} Operations</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2">
                            <div className="flex flex-wrap gap-1">
                              {tool.operations.map((op) => (
                                <Badge key={op} variant="outline" className="text-xs">
                                  {op}
                                </Badge>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {tool.lastUsed ? (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tool.lastUsed}
                              </span>
                              <span>{tool.usageCount} uses</span>
                            </>
                          ) : (
                            <span>Not installed</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={tool.isInstalled ? 'outline' : 'default'}
                          className="gap-2"
                          onClick={() => setSelectedTool(tool)}
                        >
                          {tool.isInstalled ? (
                            <>
                              <Play className="h-3 w-3" />
                              Execute
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Install
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="execute" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Execute Tool</CardTitle>
                  <CardDescription>Select a tool and configure parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Tool</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {mcpTools.filter(t => t.isInstalled).map((tool) => (
                          <SelectItem key={tool.id} value={tool.id}>
                            <div className="flex items-center gap-2">
                              <tool.icon className="h-4 w-4" />
                              {tool.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operation</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read_file">read_file</SelectItem>
                        <SelectItem value="write_file">write_file</SelectItem>
                        <SelectItem value="list_directory">list_directory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Parameters (JSON)</Label>
                    <Textarea
                      placeholder='{"path": "/example/file.txt"}'
                      className="font-mono text-sm min-h-[150px]"
                    />
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    onClick={handleExecute}
                    disabled={isExecuting}
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Execute Tool
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Execution Result</CardTitle>
                      <CardDescription>Output from the tool execution</CardDescription>
                    </div>
                    {executionResult && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isExecuting ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-muted-foreground">Executing tool...</p>
                      </div>
                    </div>
                  ) : executionResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Success</span>
                        <Badge variant="secondary" className="ml-auto">
                          {executionResult.duration}
                        </Badge>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(executionResult.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                      <div className="text-center">
                        <Terminal className="h-8 w-8 mx-auto mb-4 opacity-50" />
                        <p>Execute a tool to see results</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Recent tool executions and their results</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {executionHistory.map((execution, index) => (
                      <motion.div
                        key={execution.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                          execution.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                        )}>
                          {execution.status === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{execution.tool}</span>
                            <Badge variant="outline" className="text-xs">
                              {execution.operation}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {execution.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {execution.duration}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Details
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
