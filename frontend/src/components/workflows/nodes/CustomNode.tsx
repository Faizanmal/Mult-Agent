'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MoreHorizontal,
  Zap,
  Database,
  Globe,
  Bot,
  GitBranch
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CustomNodeData {
  label: string
  type: string
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'paused'
  config: Record<string, unknown>
  inputs?: { id: string; name: string; type: string }[]
  outputs?: { id: string; name: string; type: string }[]
  metrics?: {
    executionTime?: number
    successRate?: number
    lastRun?: string
  }
  errors?: string[]
  warnings?: string[]
}

const getNodeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    'agent_task': <Bot className="w-4 h-4" />,
    'multi_agent': <Bot className="w-4 h-4" />,
    'api_call': <Globe className="w-4 h-4" />,
    'database': <Database className="w-4 h-4" />,
    'conditional': <GitBranch className="w-4 h-4" />,
    'parallel': <Zap className="w-4 h-4" />,
    'default': <Settings className="w-4 h-4" />
  }
  return icons[type] || icons['default']
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'running': return 'bg-blue-500'
    case 'completed': return 'bg-green-500'
    case 'failed': return 'bg-red-500'
    case 'paused': return 'bg-yellow-500'
    default: return 'bg-gray-400'
  }
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'running': return <Clock className="w-3 h-3" />
    case 'completed': return <CheckCircle className="w-3 h-3" />
    case 'failed': return <AlertCircle className="w-3 h-3" />
    case 'paused': return <Pause className="w-3 h-3" />
    default: return null
  }
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasInputs = data.inputs && data.inputs.length > 0
  const hasOutputs = data.outputs && data.outputs.length > 0
  const hasMetrics = data.metrics && Object.keys(data.metrics).length > 0
  const hasIssues = (data.errors && data.errors.length > 0) || (data.warnings && data.warnings.length > 0)

  return (
    <div className={`min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Card className="shadow-lg border-2 hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                {getNodeIcon(data.type)}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">{data.label}</CardTitle>
                <div className="text-xs text-muted-foreground">{data.type.replace('_', ' ')}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Status Indicator */}
              {data.status && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs text-white ${getStatusColor(data.status)}`}>
                  {getStatusIcon(data.status)}
                  <span className="capitalize">{data.status}</span>
                </div>
              )}
              
              {/* Node Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Collapse' : 'Expand'} Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>Configure</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Issues Badges */}
          {hasIssues && (
            <div className="flex space-x-1 mt-2">
              {data.errors && data.errors.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {data.errors.length} Error{data.errors.length > 1 ? 's' : ''}
                </Badge>
              )}
              {data.warnings && data.warnings.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {data.warnings.length} Warning{data.warnings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0 space-y-3">
            {/* Configuration Summary */}
            {data.config && Object.keys(data.config).length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Configuration</div>
                <div className="text-xs space-y-1">
                  {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="truncate ml-2 max-w-[100px]">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                  {Object.keys(data.config).length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{Object.keys(data.config).length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Metrics */}
            {hasMetrics && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Metrics</div>
                <div className="text-xs space-y-1">
                  {data.metrics?.executionTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Time:</span>
                      <span>{data.metrics.executionTime.toFixed(2)}s</span>
                    </div>
                  )}
                  {data.metrics?.successRate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span>{(data.metrics.successRate * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {data.metrics?.lastRun && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span>{new Date(data.metrics.lastRun).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Error Details */}
            {data.errors && data.errors.length > 0 && (
              <div>
                <div className="text-xs font-medium text-red-600 mb-1">Errors</div>
                <div className="text-xs text-red-600 space-y-1">
                  {data.errors.slice(0, 2).map((error, index) => (
                    <div key={index} className="truncate">{error}</div>
                  ))}
                  {data.errors.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{data.errors.length - 2} more errors...
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* Dynamic Input Handles */}
      {hasInputs ? (
        data.inputs?.map((input, index) => (
          <Handle
            key={`input-${input.id}`}
            type="target"
            position={Position.Left}
            id={input.id}
            style={{
              top: `${30 + index * 20}px`,
              background: '#3b82f6',
              width: 8,
              height: 8
            }}
            className="!border-2 !border-white"
          />
        ))
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-blue-500 !border-2 !border-white !w-3 !h-3"
        />
      )}
      
      {/* Dynamic Output Handles */}
      {hasOutputs ? (
        data.outputs?.map((output, index) => (
          <Handle
            key={`output-${output.id}`}
            type="source"
            position={Position.Right}
            id={output.id}
            style={{
              top: `${30 + index * 20}px`,
              background: '#10b981',
              width: 8,
              height: 8
            }}
            className="!border-2 !border-white"
          />
        ))
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-green-500 !border-2 !border-white !w-3 !h-3"
        />
      )}
    </div>
  )
}

export default memo(CustomNode)