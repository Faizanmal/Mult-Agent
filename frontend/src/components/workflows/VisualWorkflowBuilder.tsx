'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { 
  Workflow, 
  Play, 
  Square,
  Plus,
  Copy,
  Trash2,
  Eye,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Layers
} from 'lucide-react';
import { 
  getWorkflowTemplates,
  createWorkflowTemplate,
  cloneWorkflowTemplate,
  deleteWorkflowTemplate,
  executeWorkflowTemplate,
  getWorkflowExecutions
} from '@/lib/api';
import { toast } from 'sonner';

interface WorkflowNode {
  id: string;
  node_type: string;
  config: Record<string, unknown>;
  position_x?: number;
  position_y?: number;
}

interface WorkflowEdge {
  id: string;
  source_node: string;
  target_node: string;
  condition?: Record<string, unknown>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow_definition: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  version: number;
  is_active: boolean;
  created_by?: { username: string };
  created_at: string;
  updated_at: string;
}

interface WorkflowExecution {
  id: string;
  template: { id: string; name: string };
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  error_message: string;
  started_at: string;
  completed_at: string | null;
}

const nodeTypes = [
  { value: 'start', label: 'Start', icon: Play, color: 'bg-green-500' },
  { value: 'task', label: 'Task', icon: CheckCircle, color: 'bg-blue-500' },
  { value: 'decision', label: 'Decision', icon: GitBranch, color: 'bg-yellow-500' },
  { value: 'parallel', label: 'Parallel', icon: Layers, color: 'bg-purple-500' },
  { value: 'end', label: 'End', icon: Square, color: 'bg-red-500' },
];

export default function VisualWorkflowBuilder() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    nodes: [] as WorkflowNode[],
    edges: [] as WorkflowEdge[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesRes, executionsRes] = await Promise.all([
        getWorkflowTemplates(),
        getWorkflowExecutions()
      ]);

      setTemplates(templatesRes.data.results || templatesRes.data);
      setExecutions(executionsRes.data.results || executionsRes.data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await createWorkflowTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        category: 'general',
        workflow_definition: {
          nodes: newTemplate.nodes.length > 0 ? newTemplate.nodes : [
            { id: 'start', node_type: 'start', config: {} },
            { id: 'end', node_type: 'end', config: {} }
          ],
          edges: newTemplate.edges.length > 0 ? newTemplate.edges : [
            { id: 'edge1', source_node: 'start', target_node: 'end' }
          ]
        } as Record<string, unknown>
      });
      toast.success('Workflow template created successfully');
      setCreateDialogOpen(false);
      setNewTemplate({ name: '', description: '', nodes: [], edges: [] });
      loadData();
    } catch {
      toast.error('Failed to create workflow template');
    }
  };

  const handleCloneTemplate = async (id: string) => {
    try {
      await cloneWorkflowTemplate(id);
      toast.success('Workflow template cloned successfully');
      loadData();
    } catch {
      toast.error('Failed to clone workflow template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteWorkflowTemplate(id);
      toast.success('Workflow template deleted successfully');
      loadData();
    } catch {
      toast.error('Failed to delete workflow template');
    }
  };

  const handleExecuteTemplate = async (id: string) => {
    try {
      await executeWorkflowTemplate(id, { trigger: 'manual' });
      toast.success('Workflow execution started');
      loadData();
    } catch {
      toast.error('Failed to execute workflow');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportWorkflow = (template: WorkflowTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `workflow-${template.name}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Workflow exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Workflow className="h-12 w-12 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Workflow className="h-8 w-8 text-blue-500" />
            Visual Workflow Builder
          </h1>
          <p className="text-gray-600 mt-2">
            Design and execute multi-agent workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {templates.filter(t => t.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{executions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {executions.length > 0 
                ? ((executions.filter(e => e.status === 'completed').length / executions.length) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="executions">Executions ({executions.length})</TabsTrigger>
          <TabsTrigger value="builder">Visual Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Workflow className="h-4 w-4 text-blue-500" />
                        {template.name}
                        {template.is_active && (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {template.workflow_definition.nodes?.length || 0} nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4" />
                      {template.workflow_definition.edges?.length || 0} edges
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">v{template.version}</Badge>
                    <span className="text-gray-500">
                      {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleExecuteTemplate(template.id)}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Execute
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCloneTemplate(template.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportWorkflow(template)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No workflow templates yet</p>
                  <p className="text-sm text-gray-500 mt-2">Create your first workflow to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <CardTitle className="text-lg">{execution.template.name}</CardTitle>
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(execution.started_at).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Started</Label>
                      <p className="font-medium">{new Date(execution.started_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Completed</Label>
                      <p className="font-medium">
                        {execution.completed_at 
                          ? new Date(execution.completed_at).toLocaleString() 
                          : 'In Progress'}
                      </p>
                    </div>
                  </div>

                  {execution.error_message && (
                    <div className="pt-2 border-t">
                      <Label className="text-red-600">Error</Label>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                        {execution.error_message}
                      </p>
                    </div>
                  )}

                  {execution.output_data && (
                    <details className="pt-2 border-t">
                      <summary className="text-sm text-gray-600 cursor-pointer">Output Data</summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(execution.output_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
            {executions.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No workflow executions yet</p>
                  <p className="text-sm text-gray-500 mt-2">Execute a workflow template to see results here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Workflow Designer</CardTitle>
              <CardDescription>
                Drag and drop nodes to design your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[500px] bg-gray-50">
                <div className="text-center">
                  <Workflow className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Visual Workflow Canvas
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Interactive drag-and-drop workflow builder coming soon!
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
                    {nodeTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                        >
                          <div className={`${type.color} p-3 rounded-full`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-gray-400 mt-6">
                    Use the Templates tab to create and manage workflows
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow Template</DialogTitle>
            <DialogDescription>Define a new workflow template</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="My Workflow"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Describe your workflow..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateTemplate} className="flex-1">
                Create Template
              </Button>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Template Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>{selectedTemplate.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Workflow Definition</Label>
                <pre className="mt-2 p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(selectedTemplate.workflow_definition, null, 2)}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Version</Label>
                  <p className="font-medium">v{selectedTemplate.version}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedTemplate.is_active ? 'default' : 'secondary'}>
                    {selectedTemplate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{new Date(selectedTemplate.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Updated</Label>
                  <p className="font-medium">{new Date(selectedTemplate.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
