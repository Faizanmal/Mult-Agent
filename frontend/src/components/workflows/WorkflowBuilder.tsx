'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  NodeTypes,
  EdgeTypes,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings2,
  GitBranch,
  Zap,
  Globe,
  Timer,
  Bot,
  Monitor,
  Library,
  Users,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { executeAgentWorkflow, getAgentWorkflowTemplates, type WorkflowTemplate as ApiWorkflowTemplate } from '@/lib/api'

// Import new components
import CustomNode from './nodes/CustomNode'
import NodeGroup from './nodes/NodeGroup'
import CustomEdge from './edges/CustomEdge'
import NodeTemplateLibrary from './NodeTemplateLibrary'
import AIWorkflowAssistant from './AIWorkflowAssistant'
import AdvancedAnalyticsDashboard from '../analytics/AdvancedAnalyticsDashboard'
import AdvancedTaskManager from '../tasks/AdvancedTaskManager'
import WorkflowAutomationManager from './WorkflowAutomationManager'
import CollaborativeWorkflowSystem from './CollaborativeWorkflowSystem'
import SmartVersionControl from './SmartVersionControl'

interface WorkflowStep {
  id: string
  type: string
  config: Record<string, unknown>
  dependencies?: string[]
  position: { x: number; y: number }
}

interface WorkflowDefinition {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  metadata: Record<string, unknown>
}

interface WorkflowExecution {
  workflow_id: string
  success: boolean
  results: Record<string, unknown>
  execution_time: number
  steps_executed: number
  total_steps: number
  error?: string
}

interface WorkflowMetrics {
  nodeCount: number
  edgeCount: number
  disconnectedNodes: number
  warnings: number
  complexity: number
  performance?: string
  lastOptimized?: string
}

interface TemplateShort {
  id: string
  name?: string
  description?: string
}

const WORKFLOW_DRAFT_STORAGE_KEY = 'workflow-builder-draft'

const stepTypes = [
  { value: 'agent_task', label: 'Agent Task', icon: '🤖', color: '#3b82f6', category: 'agents' },
  { value: 'multi_agent', label: 'Multi-Agent', icon: '👥', color: '#7c3aed', category: 'agents' },
  { value: 'conditional', label: 'Conditional', icon: '🔀', color: '#f59e0b', category: 'logic' },
  { value: 'parallel', label: 'Parallel', icon: '⚡', color: '#10b981', category: 'logic' },
  { value: 'loop', label: 'Loop', icon: '🔄', color: '#ec4899', category: 'logic' },
  { value: 'switch', label: 'Switch', icon: '🎛️', color: '#84cc16', category: 'logic' },
  { value: 'data_transform', label: 'Transform', icon: '🔄', color: '#8b5cf6', category: 'data' },
  { value: 'data_filter', label: 'Filter', icon: '🔍', color: '#06b6d4', category: 'data' },
  { value: 'data_merge', label: 'Merge', icon: '🔗', color: '#059669', category: 'data' },
  { value: 'api_call', label: 'API Call', icon: '🌐', color: '#06b6d4', category: 'integration' },
  { value: 'webhook', label: 'Webhook', icon: '📡', color: '#0891b2', category: 'integration' },
  { value: 'database', label: 'Database', icon: '💾', color: '#7c2d12', category: 'integration' },
  { value: 'delay', label: 'Delay', icon: '⏱️', color: '#6b7280', category: 'utility' },
  { value: 'schedule', label: 'Schedule', icon: '📅', color: '#9333ea', category: 'utility' },
  { value: 'notification', label: 'Notification', icon: '📢', color: '#ef4444', category: 'utility' },
  { value: 'email', label: 'Email', icon: '📧', color: '#dc2626', category: 'utility' },
  { value: 'file_upload', label: 'File Upload', icon: '📁', color: '#ca8a04', category: 'utility' },
  { value: 'code_execution', label: 'Code Runner', icon: '⚡', color: '#1d4ed8', category: 'advanced' },
]

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    position: { x: 250, y: 50 },
    data: { label: 'Start' },
  },
]

const initialEdges: Edge[] = []

const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [workflowName, setWorkflowName] = useState('New Workflow')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<WorkflowExecution | null>(null)
  const [showStepConfig, setShowStepConfig] = useState(false)
  const [stepConfig, setStepConfig] = useState<Record<string, unknown>>({})
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([])
  
  // New enhanced state
  const [showNodeTemplateLibrary, setShowNodeTemplateLibrary] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [activeTab, setActiveTab] = useState('builder')
  const [workflowTemplates, setWorkflowTemplates] = useState<TemplateShort[]>([])
  const [showExecutionMonitor, setShowExecutionMonitor] = useState(false)
  const [workflowViewMode, setWorkflowViewMode] = useState<'design' | 'execution' | 'analysis'>('design')
  const [clipboardNodes, setClipboardNodes] = useState<Node[]>([])
  const [undoStack, setUndoStack] = useState<{nodes: Node[], edges: Edge[]}[]>([])
  const [redoStack, setRedoStack] = useState<{nodes: Node[], edges: Edge[]}[]>([])
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false)
  const [showTaskManager, setShowTaskManager] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [collaborationMode, setCollaborationMode] = useState(false)
  const [workflowMetrics, setWorkflowMetrics] = useState<WorkflowMetrics>({
    nodeCount: 0,
    edgeCount: 0,
    disconnectedNodes: 0,
    warnings: 0,
    complexity: 0
  })
  const [autoOptimize, setAutoOptimize] = useState(false)
  const [showAutomationManager, setShowAutomationManager] = useState(false)
  const [showCollaborativeSystem, setShowCollaborativeSystem] = useState(false)
  const [showVersionControl, setShowVersionControl] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState<{ next_run?: string | null, frequency?: string | null }>({ next_run: null, frequency: null })
  
  // Execution monitoring state
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle')
  const [executionSteps, setExecutionSteps] = useState<Array<{
    id: string
    name: string
    type: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    duration?: number
    error?: string
    output?: unknown
  }>>([])
  const [executionDuration, setExecutionDuration] = useState(0)
  const [executionStartTime, setExecutionStartTime] = useState<string | null>(null)
  const [executionLogs, setExecutionLogs] = useState<Array<{
    timestamp: string
    level: 'info' | 'warning' | 'error' | 'debug'
    message: string
  }>>([])

  const { toast } = useToast()

  // Define custom node and edge types
  const nodeTypes: NodeTypes = useMemo(() => ({
    custom: CustomNode,
    group: NodeGroup,
  }), [])

  const edgeTypes: EdgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), [])
  
  // Utility functions for enhanced features
  const saveToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), { nodes, edges }]) // Keep last 20 states
    setRedoStack([]) // Clear redo stack when new action is performed
  }, [nodes, edges])
  
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1]
      setRedoStack(prev => [...prev, { nodes, edges }])
      setNodes(lastState.nodes)
      setEdges(lastState.edges)
      setUndoStack(prev => prev.slice(0, -1))
    }
  }, [undoStack, nodes, edges, setNodes, setEdges])
  
  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1]
      setUndoStack(prev => [...prev, { nodes, edges }])
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setRedoStack(prev => prev.slice(0, -1))
    }
  }, [redoStack, nodes, edges, setNodes, setEdges])
  
  const handleCopyNodes = useCallback(() => {
    const selectedNodeObjects = nodes.filter(node => node.selected)
    setClipboardNodes(selectedNodeObjects)
    toast({
      title: 'Nodes Copied',
      description: `${selectedNodeObjects.length} node(s) copied to clipboard`,
    })
  }, [nodes, toast])

  // Load workflow templates on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await getAgentWorkflowTemplates()
        setWorkflowTemplates(
          (data.templates || []).map((template: ApiWorkflowTemplate) => ({
            id: template.id,
            name: template.name,
            description: template.description,
          }))
        )
      } catch (e) {
        console.error('Failed to load workflow templates', e);
      }
    }

    loadTemplates();
  }, []);
  
  const handlePasteNodes = useCallback(() => {
    if (clipboardNodes.length === 0) return
    
    const pastedNodes = clipboardNodes.map(node => ({
      ...node,
      id: `${node.data.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50
      }
    }))
    
    setNodes(nds => [...nds, ...pastedNodes])
    saveToUndoStack()
    
    toast({
      title: 'Nodes Pasted',
      description: `${pastedNodes.length} node(s) pasted`,
    })
  }, [clipboardNodes, setNodes, saveToUndoStack, toast])

  // Save workflow function
  const saveWorkflow = useCallback(async () => {
    const workflow: WorkflowDefinition = {
      id: `workflow_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      steps: nodes
        .filter((node: Node) => node.id !== 'start')
        .map((node: Node) => ({
          id: node.id,
          type: node.data.type,
          config: node.data.config || {},
          position: node.position,
          dependencies: edges
            .filter((edge: Edge) => edge.target === node.id)
            .map((edge: Edge) => edge.source),
        })),
      metadata: {
        created_at: new Date().toISOString(),
        version: '1.0.0',
      },
    }

    try {
      localStorage.setItem(WORKFLOW_DRAFT_STORAGE_KEY, JSON.stringify(workflow))
      toast({
        title: 'Workflow Draft Saved',
        description: 'Saved locally in this browser until backend template persistence is wired.',
      })
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save workflow. Please try again.',
        variant: 'destructive',
      })
    }
  }, [workflowName, workflowDescription, nodes, edges, toast])
  
  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return
    
    const autoSaveInterval = setInterval(() => {
      if (nodes.length > 1) { // Only auto-save if there are nodes besides start
        saveWorkflow()
      }
    }, 30000) // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval)
  }, [autoSaveEnabled, nodes, saveWorkflow])
  
  // Workflow optimization
  useEffect(() => {
    if (!autoOptimize) return
    
    const optimizeWorkflow = () => {
      // Auto-optimize node positions
      const optimizedNodes = nodes.map((node, index) => {
        if (node.id === 'start') return node
        
        return {
          ...node,
          position: {
            x: 200 + (index % 3) * 300,
            y: 150 + Math.floor(index / 3) * 200
          }
        }
      })
      
      setNodes(optimizedNodes)
    }
    
    const optimizeInterval = setInterval(optimizeWorkflow, 60000) // Auto-optimize every minute
    return () => clearInterval(optimizeInterval)
  }, [autoOptimize, nodes, setNodes])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault()
            if (event.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case 'c':
            if (selectedNode) {
              event.preventDefault()
              handleCopyNodes()
            }
            break
          case 'v':
            event.preventDefault()
            handlePasteNodes()
            break
          case 's':
            event.preventDefault()
            saveWorkflow()
            break
          case 'a':
            if (event.shiftKey) {
              event.preventDefault()
              setShowAnalyticsDashboard(true)
            }
            break
          case 't':
            if (event.shiftKey) {
              event.preventDefault()
              setShowTaskManager(true)
            }
            break
          case 'r':
            if (event.shiftKey) {
              event.preventDefault()
              setShowAutomationManager(true)
            }
            break
          case 'g':
            if (event.shiftKey) {
              event.preventDefault()
              setShowVersionControl(true)
            }
            break
          case 'u':
            if (event.shiftKey) {
              event.preventDefault()
              setShowCollaborativeSystem(true)
            }
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo, handleCopyNodes, handlePasteNodes, saveWorkflow, selectedNode])

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      const edge: Edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'custom',
        data: {
          label: 'Connection',
          status: 'inactive'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }
      setEdges((eds: Edge[]) => addEdge(edge, eds))
      
      // Save state for undo functionality
      saveToUndoStack()
    }
  }, [setEdges, saveToUndoStack])

  const addStepNode = (stepType: string, template?: unknown) => {
    const nodeId = `${stepType}_${Date.now()}`
    const stepTypeConfig = stepTypes.find(st => st.value === stepType)
    
    // Smart positioning based on existing nodes
    const getSmartPosition = () => {
      const lastNode = nodes[nodes.length - 1]
      if (!lastNode) return { x: 300, y: 200 }
      
      return {
        x: lastNode.position.x + 250,
        y: lastNode.position.y + (nodes.length % 2 === 0 ? 50 : -50)
      }
    }
    
    const newNode: Node = {
      id: nodeId,
      type: 'custom',
      position: getSmartPosition(),
      data: { 
        label: stepTypeConfig?.label || stepType,
        type: stepType,
        status: 'idle',
        config: template || {},
        inputs: [],
        outputs: [],
        metrics: {
          executionTime: 0,
          successRate: 1,
          lastRun: new Date().toISOString()
        },
        errors: [],
        warnings: []
      },
      style: {
        backgroundColor: stepTypeConfig?.color || '#6b7280',
        color: 'white',
        borderRadius: 8,
        padding: '10px',
      },
    }

    setNodes((nds: Node[]) => nds.concat(newNode))
    saveToUndoStack()
    
    // Auto-validate workflow after adding node
    validateWorkflow([...nodes, newNode], edges)
    
    toast({
      title: 'Node Added',
      description: `${stepTypeConfig?.label || stepType} node added to workflow`,
    })
  }
  
  // Workflow validation function
  const validateWorkflow = (currentNodes: Node[], currentEdges: Edge[]) => {
    const warnings = []
    const suggestions = []
    
    // Check for disconnected nodes
    const connectedNodes = new Set()
    currentEdges.forEach(edge => {
      connectedNodes.add(edge.source)
      connectedNodes.add(edge.target)
    })
    
    const disconnectedNodes = currentNodes.filter(node => 
      node.id !== 'start' && !connectedNodes.has(node.id)
    )
    
    if (disconnectedNodes.length > 0) {
      warnings.push(`${disconnectedNodes.length} disconnected node(s) found`)
      suggestions.push('Connect isolated nodes to enable proper workflow execution')
    }
    
    // Check for potential infinite loops
    const hasLoops = currentEdges.some(edge => edge.source === edge.target)
    if (hasLoops) {
      warnings.push('Potential infinite loop detected')
      suggestions.push('Review self-referencing connections')
    }
    
    // Update workflow metrics
    setWorkflowMetrics({
      nodeCount: currentNodes.length - 1, // Exclude start node
      edgeCount: currentEdges.length,
      disconnectedNodes: disconnectedNodes.length,
      warnings: warnings.length,
      complexity: Math.round((currentNodes.length + currentEdges.length) / 2)
    })
    
    // Show suggestions if any
    if (suggestions.length > 0 && autoOptimize) {
      toast({
        title: 'Workflow Optimization Suggestion',
        description: suggestions[0],
        duration: 5000,
      })
    }
  }

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setStepConfig(node.data.config || {})
    setShowStepConfig(true)
  }

  const updateStepConfig = () => {
    if (!selectedNode) return

    setNodes((nds: Node[]) =>
      nds.map((node: Node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: stepConfig,
            },
          }
        }
        return node
      })
    )
    
    setShowStepConfig(false)
    setSelectedNode(null)
  }

  const deleteNode = (nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId))
    setEdges((eds: Edge[]) => eds.filter((edge: Edge) => edge.source !== nodeId && edge.target !== nodeId))
    setShowStepConfig(false)
    setSelectedNode(null)
  }


  const executeWorkflow = async () => {
    setIsExecuting(true)
    setExecutionStatus('running')
    setExecutionStartTime(new Date().toISOString())
    setExecutionDuration(0)
    
    // Initialize execution steps from nodes
    const steps = nodes
      .filter((node: Node) => node.id !== 'start')
      .map((node: Node) => ({
        id: node.id,
        name: node.data.label || node.id,
        type: node.data.type || 'agent_task',
        status: 'pending' as const,
      }))
    setExecutionSteps(steps)
    
    // Add initial log
    setExecutionLogs([{
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: `Starting workflow execution: ${workflowName}`
    }])
    
    // Open execution monitor
    setShowExecutionMonitor(true)
    
    const workflowDef: WorkflowDefinition = {
      id: `temp_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      steps: nodes
        .filter((node: Node) => node.id !== 'start')
        .map((node: Node) => ({
          id: node.id,
          type: node.data.type,
          config: node.data.config || {},
          position: node.position,
          dependencies: edges
            .filter((edge: Edge) => edge.target === node.id)
            .map((edge: Edge) => edge.source),
        })),
      metadata: {
        executed_at: new Date().toISOString(),
        node_count: nodes.length - 1,
        edge_count: edges.length,
      },
    }

    const startTime = Date.now()
    const durationInterval = setInterval(() => {
      setExecutionDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    try {
      setExecutionLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'Workflow request sent to backend orchestration engine'
      }])

      const data = await executeAgentWorkflow(workflowDef, {})
      setExecutionResults(data)

      // Update steps with completion
      setExecutionSteps(prev => prev.map(s => ({
        ...s,
        status: data.success ? 'completed' as const : 'failed' as const,
        output: data.results[s.id]
      })))
      
      setExecutionStatus(data.success ? 'completed' : 'failed')
      
      setExecutionLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level: data.success ? 'info' : 'error',
        message: data.success 
          ? `Workflow completed successfully in ${data.execution_time.toFixed(2)}s`
          : `Workflow failed: ${data.error}`
      }])

      setExecutionHistory(prev => [data, ...prev.slice(0, 9)])

      if (data.success) {
        toast({
          title: 'Workflow Executed Successfully',
          description: `Workflow "${workflowName}" completed in ${data.execution_time.toFixed(2)}s with ${data.steps_executed} steps`,
        })
      } else {
        toast({
          title: 'Workflow Execution Failed',
          description: data.error || 'Unknown error occurred during execution',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error executing workflow:', error)
      
      setExecutionStatus('failed')
      setExecutionSteps(prev => prev.map(s => ({
        ...s,
        status: 'failed' as const,
        error: 'Execution interrupted'
      })))
      
      setExecutionLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
        message: `Execution error: ${error instanceof Error ? error.message : 'Network error'}`
      }])
      
      const errorResult: WorkflowExecution = {
        workflow_id: workflowDef.id,
        success: false,
        results: {},
        execution_time: (Date.now() - startTime) / 1000,
        steps_executed: 0,
        total_steps: workflowDef.steps.length,
        error: 'Network error or server unavailable'
      }
      
      setExecutionResults(errorResult)
      setExecutionHistory(prev => [errorResult, ...prev.slice(0, 9)])
      
      toast({
        title: 'Execution Error',
        description: 'Failed to execute workflow. Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      clearInterval(durationInterval)
      setIsExecuting(false)
    }
  }

  const renderStepConfig = () => {
    if (!selectedNode) return null

    const stepType = selectedNode.data.type

    return (
      <div className="space-y-4">
        <div>
          <Label>Step Name</Label>
          <Input
            value={(stepConfig.title as string) || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setStepConfig({ ...stepConfig, title: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={(stepConfig.description as string) || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              setStepConfig({ ...stepConfig, description: e.target.value })
            }
          />
        </div>

        {stepType === 'multi_agent' && (
          <>
            <div>
              <Label>Agent Count</Label>
              <Input
                type="number"
                value={stepConfig.agent_count as number || 2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, agent_count: parseInt(e.target.value) })
                }
                min={2}
                max={10}
              />
            </div>
            <div>
              <Label>Coordination Strategy</Label>
              <Select 
                value={stepConfig.coordination_strategy as string || 'sequential'} 
                onValueChange={(value: string) => setStepConfig({ ...stepConfig, coordination_strategy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                  <SelectItem value="voting">Voting</SelectItem>
                  <SelectItem value="consensus">Consensus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {stepType === 'loop' && (
          <>
            <div>
              <Label>Loop Type</Label>
              <Select 
                value={stepConfig.loop_type as string || 'count'} 
                onValueChange={(value: string) => setStepConfig({ ...stepConfig, loop_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Count-based</SelectItem>
                  <SelectItem value="condition">Condition-based</SelectItem>
                  <SelectItem value="foreach">For Each Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stepConfig.loop_type === 'count' && (
              <div>
                <Label>Iterations</Label>
                <Input
                  type="number"
                  value={stepConfig.iterations as number || 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setStepConfig({ ...stepConfig, iterations: parseInt(e.target.value) })
                  }
                  min={1}
                />
              </div>
            )}
            {stepConfig.loop_type === 'condition' && (
              <div>
                <Label>Loop Condition</Label>
                <Input
                  value={stepConfig.loop_condition as string || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setStepConfig({ ...stepConfig, loop_condition: e.target.value })
                  }
                  placeholder="e.g., result.success === false"
                />
              </div>
            )}
          </>
        )}

        {stepType === 'switch' && (
          <>
            <div>
              <Label>Switch Variable</Label>
              <Input
                value={stepConfig.switch_variable as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, switch_variable: e.target.value })
                }
                placeholder="Variable to switch on"
              />
            </div>
            <div>
              <Label>Cases (JSON)</Label>
              <Textarea
                value={JSON.stringify(stepConfig.cases || {}, null, 2)}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  try {
                    const cases = JSON.parse(e.target.value)
                    setStepConfig({ ...stepConfig, cases })
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='{"case1": "action1", "case2": "action2"}'
                rows={4}
              />
            </div>
          </>
        )}

        {stepType === 'webhook' && (
          <>
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={stepConfig.webhook_url as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, webhook_url: e.target.value })
                }
                placeholder="https://example.com/webhook"
              />
            </div>
            <div>
              <Label>Secret</Label>
              <Input
                type="password"
                value={stepConfig.secret as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, secret: e.target.value })
                }
                placeholder="Webhook secret"
              />
            </div>
          </>
        )}

        {stepType === 'database' && (
          <>
            <div>
              <Label>Operation</Label>
              <Select 
                value={stepConfig.operation as string || 'query'} 
                onValueChange={(value: string) => setStepConfig({ ...stepConfig, operation: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="query">Query</SelectItem>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SQL Query</Label>
              <Textarea
                value={stepConfig.query as string || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setStepConfig({ ...stepConfig, query: e.target.value })
                }
                placeholder="SELECT * FROM table WHERE condition"
                rows={3}
              />
            </div>
          </>
        )}

        {stepType === 'schedule' && (
          <>
            <div>
              <Label>Schedule Type</Label>
              <Select 
                value={stepConfig.schedule_type as string || 'cron'} 
                onValueChange={(value: string) => setStepConfig({ ...stepConfig, schedule_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cron">Cron Expression</SelectItem>
                  <SelectItem value="interval">Interval</SelectItem>
                  <SelectItem value="once">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stepConfig.schedule_type === 'cron' && (
              <div>
                <Label>Cron Expression</Label>
                <Input
                  value={stepConfig.cron_expression as string || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setStepConfig({ ...stepConfig, cron_expression: e.target.value })
                  }
                  placeholder="0 0 * * *"
                />
              </div>
            )}
            {stepConfig.schedule_type === 'interval' && (
              <div>
                <Label>Interval (minutes)</Label>
                <Input
                  type="number"
                  value={stepConfig.interval_minutes as number || 60}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setStepConfig({ ...stepConfig, interval_minutes: parseInt(e.target.value) })
                  }
                  min={1}
                />
              </div>
            )}
          </>
        )}

        {stepType === 'email' && (
          <>
            <div>
              <Label>Recipients</Label>
              <Input
                value={stepConfig.recipients as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, recipients: e.target.value })
                }
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={stepConfig.subject as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, subject: e.target.value })
                }
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label>Body Template</Label>
              <Textarea
                value={stepConfig.body as string || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setStepConfig({ ...stepConfig, body: e.target.value })
                }
                placeholder="Email body with {{variables}}"
                rows={4}
              />
            </div>
          </>
        )}

        {stepType === 'code_execution' && (
          <>
            <div>
              <Label>Language</Label>
              <Select 
                value={stepConfig.language as string || 'python'} 
                onValueChange={(value: string) => setStepConfig({ ...stepConfig, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="bash">Bash</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code</Label>
              <Textarea
                value={stepConfig.code as string || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setStepConfig({ ...stepConfig, code: e.target.value })
                }
                placeholder="Enter your code here"
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label>Timeout (seconds)</Label>
              <Input
                type="number"
                value={stepConfig.timeout as number || 30}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, timeout: parseInt(e.target.value) })
                }
                min={1}
                max={300}
              />
            </div>
          </>
        )}

        {stepType === 'conditional' && (
          <div>
            <Label>Condition</Label>
            <Input
              value={stepConfig.condition as string || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setStepConfig({ ...stepConfig, condition: e.target.value })
              }
              placeholder="Enter condition logic"
            />
          </div>
        )}

        {stepType === 'api_call' && (
          <>
            <div>
              <Label>URL</Label>
              <Input
                value={stepConfig.url as string || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setStepConfig({ ...stepConfig, url: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select 
                value={stepConfig.method as string || 'GET'} 
                onValueChange={(value: string) => setStepConfig({ ...stepConfig, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {stepType === 'delay' && (
          <div>
            <Label>Seconds</Label>
            <Input
              type="number"
              value={stepConfig.seconds as number || 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setStepConfig({ ...stepConfig, seconds: parseInt(e.target.value) })
              }
            />
          </div>
        )}

        {stepType === 'notification' && (
          <div>
            <Label>Message</Label>
            <Textarea
              value={stepConfig.message as string || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setStepConfig({ ...stepConfig, message: e.target.value })
              }
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Input
              value={workflowName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold border-none p-0 h-auto"
            />
            <Textarea
              value={workflowDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWorkflowDescription(e.target.value)}
              placeholder="Workflow description..."
              className="text-muted-foreground border-none p-0 resize-none"
              rows={1}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNodeTemplateLibrary(true)}
            >
              <Library className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAIAssistant(true)}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExecutionMonitor(true)}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Monitor
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCollaborativeSystem(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVersionControl(true)}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Versions
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAutomationManager(true)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Automation
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              title={`Auto-save: ${autoSaveEnabled ? 'ON' : 'OFF'}`}
            >
              <Timer className={`w-4 h-4 mr-2 ${autoSaveEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              Auto-Save
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
            >
              Undo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              Redo
            </Button>
            <Button onClick={saveWorkflow} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              onClick={executeWorkflow} 
              disabled={isExecuting}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-9 w-full text-xs">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <div className="space-y-4">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                Workflow Components
              </div>
              
              {/* Categorized Step Types */}
              <div className="space-y-3">
                {['agents', 'logic', 'data', 'integration', 'utility', 'advanced'].map(category => (
                  <div key={category} className="space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {category}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {stepTypes.filter(st => st.category === category).map((stepType) => (
                        <Button
                          key={stepType.value}
                          onClick={() => addStepNode(stepType.value)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:shadow-sm transition-all"
                          style={{ 
                            borderColor: stepType.color + '40',
                            backgroundColor: stepType.color + '08'
                          }}
                        >
                          <span>{stepType.icon}</span>
                          <span className="text-xs">{stepType.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Workflow Templates</h3>
                <Button 
                  onClick={() => setShowNodeTemplateLibrary(true)}
                  size="sm" 
                  variant="outline"
                >
                  Browse Library
                </Button>
              </div>
              
              {workflowTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No templates saved yet</p>
                  <p className="text-sm">Save your current workflow as a template to reuse it later</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {workflowTemplates.map((template: TemplateShort) => (
                      <Card key={template.id} className="p-3 hover:shadow-sm cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => addStepNode(template.name?.toLowerCase().replace(/\s+/g, '_') || 'template', { templateId: template.id })}>
                          Use Template
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Workflow Analytics</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowAnalyticsDashboard(true)}
                    size="sm" 
                    variant="outline"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Full Dashboard
                  </Button>
                  <Button 
                    onClick={() => setAutoOptimize(!autoOptimize)}
                    size="sm" 
                    variant={autoOptimize ? "default" : "outline"}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-Optimize
                  </Button>
                </div>
              </div>
              
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold">{workflowMetrics.nodeCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Nodes</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">{workflowMetrics.edgeCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">{workflowMetrics.complexity || 0}</div>
                  <p className="text-xs text-muted-foreground">Complexity</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-orange-500">{workflowMetrics.warnings || 0}</div>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </Card>
              </div>
              
              {workflowMetrics.disconnectedNodes > 0 && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Optimization Suggestions</span>
                    </div>
                    <p className="text-sm mt-2 text-orange-700">
                      {workflowMetrics.disconnectedNodes} disconnected node(s) detected. 
                      Consider connecting them to improve workflow execution.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Workflow Tasks</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowTaskManager(true)}
                    size="sm" 
                    variant="outline"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Task Manager
                  </Button>
                  <Button 
                    onClick={() => setCollaborationMode(!collaborationMode)}
                    size="sm" 
                    variant={collaborationMode ? "default" : "outline"}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Collaborate
                  </Button>
                </div>
              </div>
              
              {/* Quick Task Overview */}
              <div className="grid gap-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Workflow Review</h4>
                      <p className="text-xs text-muted-foreground mt-1">Review and optimize current workflow</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">In Progress</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Performance Testing</h4>
                      <p className="text-xs text-muted-foreground mt-1">Test workflow performance and reliability</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">Documentation Update</h4>
                      <p className="text-xs text-muted-foreground mt-1">Update workflow documentation and guides</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Complete</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-assistant">
            <div className="h-96">
              <AIWorkflowAssistant />
              {/* Optional inline AI assistant modal handling */}
              <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Assistant</DialogTitle>
                    <DialogDescription>Generate suggestions and help for your workflow</DialogDescription>
                  </DialogHeader>
                  <div className="p-4">
                    <AIWorkflowAssistant />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="automation">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Workflow Automation</h3>
                <Button 
                  onClick={() => setShowAutomationManager(true)}
                  size="sm" 
                  variant="outline"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Full Dashboard
                </Button>
              </div>
              
              {/* Quick automation overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Active Rules</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">Executions</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">94.7%</div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">127h</div>
                  <p className="text-xs text-muted-foreground">Time Saved</p>
                </Card>
              </div>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline">Enable Auto-Save</Button>
                  <Button size="sm" variant="outline">Setup Error Recovery</Button>
                  <Button size="sm" variant="outline">Performance Optimization</Button>
                  <Button size="sm" variant="outline">Smart Routing</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="collaborate">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Team Collaboration</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowCollaborativeSystem(true)}
                    size="sm" 
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Full Workspace
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              {/* Quick collaboration overview */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">Team Members</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Online Now</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </Card>
              </div>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bob Smith edited API call configuration</span>
                    <span className="text-muted-foreground">5 min ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carol Davis added a comment</span>
                    <span className="text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alice Johnson ran the workflow</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="versions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Version Control</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowVersionControl(true)}
                    size="sm" 
                    variant="outline"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Full History
                  </Button>
                  <Badge variant="outline">v1.2.3</Badge>
                </div>
              </div>
              
              {/* Quick version overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold">v1.2.3</div>
                  <p className="text-xs text-muted-foreground">Current Version</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Active Branches</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Total Versions</p>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">2h</div>
                  <p className="text-xs text-muted-foreground">Last Commit</p>
                </Card>
              </div>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Recent Changes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Added error handling to API calls</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">main</Badge>
                      <span className="text-muted-foreground">2h ago</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fixed database connection timeout</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">hotfix</Badge>
                      <span className="text-muted-foreground">1d ago</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI optimization experiments</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">feature</Badge>
                      <span className="text-muted-foreground">3d ago</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scheduler">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Workflow Scheduler</h3>
                <Button 
                  onClick={() => setShowScheduler(true)}
                  size="sm"
                  variant={isScheduled ? "default" : "outline"}
                >
                  {isScheduled ? 'Scheduled' : 'Schedule Workflow'}
                </Button>
              </div>
              
              {isScheduled ? (
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Next Run:</span>
                      <span className="text-sm text-muted-foreground">
                        {scheduleConfig.next_run || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Frequency:</span>
                      <span className="text-sm text-muted-foreground">
                        {scheduleConfig.frequency || 'One-time'}
                      </span>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">⏰</div>
                  <p>No schedule configured</p>
                  <p className="text-sm">Set up automated workflow execution</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="font-medium">Execution History</h3>
              
              {executionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No execution history</p>
                  <p className="text-sm">Run your workflow to see execution history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {executionHistory.map((execution, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            {execution.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {execution.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {execution.steps_executed}/{execution.total_steps} steps • 
                            {execution.execution_time.toFixed(2)}s
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results">
            {executionResults ? (
              <div className="space-y-6">
                {/* Execution Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {executionResults.execution_time.toFixed(2)}s
                      </div>
                      <p className="text-xs text-muted-foreground">Execution Time</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {executionResults.steps_executed}
                      </div>
                      <p className="text-xs text-muted-foreground">Steps Executed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {executionResults.total_steps}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Steps</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className={`text-2xl font-bold flex items-center gap-2 ${
                        executionResults.success ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {executionResults.success ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <AlertCircle className="w-6 h-6" />
                        )}
                        {executionResults.success ? 'SUCCESS' : 'FAILED'}
                      </div>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Results */}
                {executionResults.results && Object.keys(executionResults.results).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Execution Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md overflow-auto text-sm">
                        {JSON.stringify(executionResults.results, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Error Details */}
                {executionResults.error && (
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Execution Error
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-red-50 dark:bg-red-950 p-4 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {executionResults.error}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Performance Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completion Rate:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(executionResults.steps_executed / executionResults.total_steps) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round((executionResults.steps_executed / executionResults.total_steps) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Step Time:</span>
                        <span className="text-sm font-medium">
                          {(executionResults.execution_time / executionResults.steps_executed).toFixed(2)}s
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Performance:</span>
                        <span className={`text-sm font-medium ${
                          executionResults.execution_time < 5 ? 'text-green-600' : 
                          executionResults.execution_time < 15 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {executionResults.execution_time < 5 ? 'Excellent' : 
                           executionResults.execution_time < 15 ? 'Good' : 'Needs Optimization'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-muted-foreground text-lg">No execution results yet</p>
                <p className="text-sm text-muted-foreground mt-2">Run your workflow to see detailed results and performance metrics</p>
                <Button 
                  onClick={executeWorkflow} 
                  disabled={isExecuting || nodes.length <= 1}
                  className="mt-4"
                  size="lg"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Workflow
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          multiSelectionKeyCode={['Control', 'Meta']}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWorkflowViewMode('design')}
              className={workflowViewMode === 'design' ? 'bg-primary text-white' : ''}
            >
              Design
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWorkflowViewMode('execution')}
              className={workflowViewMode === 'execution' ? 'bg-primary text-white' : ''}
            >
              <Monitor className="w-4 h-4 mr-1" />
              Execution
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWorkflowViewMode('analysis')}
              className={workflowViewMode === 'analysis' ? 'bg-primary text-white' : ''}
            >
              Analysis
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      <Dialog open={showStepConfig} onOpenChange={setShowStepConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Step</DialogTitle>
            <DialogDescription>
              Configure the settings for this workflow step.
            </DialogDescription>
          </DialogHeader>

          {renderStepConfig()}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => selectedNode && deleteNode(selectedNode.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={updateStepConfig}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Node Template Library Dialog */}
      <Dialog open={showNodeTemplateLibrary} onOpenChange={setShowNodeTemplateLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Node Template Library</DialogTitle>
            <DialogDescription>
              Browse and add pre-configured node templates to your workflow.
            </DialogDescription>
          </DialogHeader>
          
          <NodeTemplateLibrary
            onAddTemplate={(template) => {
              addStepNode(template.name.toLowerCase().replace(/\s+/g, '_'), template.config)
              setShowNodeTemplateLibrary(false)
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Analytics Dashboard Dialog */}
      <Dialog open={showAnalyticsDashboard} onOpenChange={setShowAnalyticsDashboard}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Advanced Analytics Dashboard</DialogTitle>
            <DialogDescription>
              Comprehensive analytics and insights for your workflow performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[70vh] overflow-auto">
            <AdvancedAnalyticsDashboard />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Task Manager Dialog */}
      <Dialog open={showTaskManager} onOpenChange={setShowTaskManager}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Advanced Task Manager</DialogTitle>
            <DialogDescription>
              Manage workflow-related tasks, assignments, and project coordination.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[70vh] overflow-auto">
            <AdvancedTaskManager />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Execution Monitor Dialog */}
      <Dialog open={showExecutionMonitor} onOpenChange={setShowExecutionMonitor}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Real-time Execution Monitor</DialogTitle>
            <DialogDescription>
              Monitor workflow execution in real-time with detailed step tracking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[60vh] overflow-auto">
            <div className="space-y-4 p-4">
              {/* Execution Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Execution Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={
                        executionStatus === 'running' ? 'default' :
                        executionStatus === 'completed' ? 'default' :
                        executionStatus === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {executionStatus === 'running' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {executionStatus === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {executionStatus === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {executionStatus || 'Idle'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Steps</p>
                      <p className="text-lg font-semibold">
                        {executionSteps.filter(s => s.status === 'completed').length} / {executionSteps.length}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold">
                        {executionDuration > 0 ? `${executionDuration}s` : '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-sm">
                        {executionStartTime ? new Date(executionStartTime).toLocaleTimeString() : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step Execution Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Step Execution Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {executionSteps.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No execution data available. Run a workflow to see real-time monitoring.
                      </p>
                    ) : (
                      executionSteps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0 mt-1">
                            {step.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {step.status === 'running' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                            {step.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {step.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Step {index + 1}: {step.name}</p>
                                <p className="text-sm text-muted-foreground">{step.type}</p>
                              </div>
                              <Badge variant="outline">
                                {step.duration ? `${step.duration}ms` : '-'}
                              </Badge>
                            </div>
                            {step.error && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                {step.error}
                              </div>
                            )}
                            {step.output != null && (
                              <details className="mt-2">
                                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                                  View Output
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-x-auto">
                                  {JSON.stringify(step.output, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Execution Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-60 overflow-y-auto font-mono text-xs bg-gray-50 p-3 rounded border">
                    {executionLogs.length === 0 ? (
                      <p className="text-muted-foreground">No logs available</p>
                    ) : (
                      executionLogs.map((log, index) => (
                        <div key={index} className={`
                          ${log.level === 'error' ? 'text-red-600' : 
                            log.level === 'warning' ? 'text-yellow-600' : 
                            log.level === 'info' ? 'text-blue-600' : 'text-gray-600'}
                        `}>
                          [{log.timestamp}] {log.level.toUpperCase()}: {log.message}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecutionMonitor(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Workflow Automation Manager Dialog */}
      <Dialog open={showAutomationManager} onOpenChange={setShowAutomationManager}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Workflow Automation Manager</DialogTitle>
            <DialogDescription>
              Advanced automation rules and intelligent workflow optimization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[75vh] overflow-auto">
            <WorkflowAutomationManager workflowId={`workflow_${Date.now()}`} />
          </div>
        </DialogContent>
      </Dialog>
      {/* Scheduler Dialog */}
      <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Workflow Scheduler</DialogTitle>
            <DialogDescription>Configure automatic workflow runs and schedules.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-2">
            <div className="flex items-center gap-2">
              <Label>Enabled</Label>
              <Switch checked={isScheduled} onCheckedChange={(v) => setIsScheduled(Boolean(v))} />
            </div>

            <div>
              <Label>Next run (ISO)</Label>
              <Input
                value={scheduleConfig.next_run || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduleConfig({ ...scheduleConfig, next_run: e.target.value })}
                placeholder="e.g., 2025-12-01T12:00:00Z"
              />
            </div>

            <div>
              <Label>Frequency</Label>
              <Select value={scheduleConfig.frequency || 'daily'} onValueChange={(val: string) => setScheduleConfig({ ...scheduleConfig, frequency: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsScheduled(false);
                setScheduleConfig({ next_run: null, frequency: null });
                setShowScheduler(false);
              }}>Cancel</Button>
              <Button onClick={() => { setShowScheduler(false); toast({ title: 'Scheduler saved', description: 'Workflow schedule updated' }); }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Collaborative Workflow System Dialog */}
      <Dialog open={showCollaborativeSystem} onOpenChange={setShowCollaborativeSystem}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Collaborative Workspace</DialogTitle>
            <DialogDescription>
              Real-time team collaboration and workflow management.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[75vh] overflow-auto">
            <CollaborativeWorkflowSystem 
              workflowId={`workflow_${Date.now()}`}
              currentUserId="current-user-id"
              onCollaborationUpdate={(data) => {
                console.log('Collaboration update:', data)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Smart Version Control Dialog */}
      <Dialog open={showVersionControl} onOpenChange={setShowVersionControl}>
        <DialogContent className="max-w-7xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Smart Version Control</DialogTitle>
            <DialogDescription>
              Advanced workflow versioning with intelligent branching and automated optimization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[75vh] overflow-auto">
            <SmartVersionControl 
              workflowId={`workflow_${Date.now()}`}
              currentVersion="v1.2.3"
              onVersionChange={(versionId) => {
                toast({
                  title: 'Version Changed',
                  description: `Switched to version ${versionId}`,
                })
              }}
              onBranchSwitch={(branchName) => {
                toast({
                  title: 'Branch Switched',
                  description: `Switched to branch: ${branchName}`,
                })
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkflowBuilder
