'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Timer
} from 'lucide-react'

interface ExecutionStep {
  id: string
  nodeId: string
  nodeName: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime?: number
  endTime?: number
  duration?: number
  progress?: number
  input?: unknown
  output?: unknown
  error?: string
  metrics?: {
    cpuUsage?: number
    memoryUsage?: number
    networkIO?: number
    diskIO?: number
  }
}

interface ExecutionSession {
  id: string
  workflowName: string
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
  startTime: number
  endTime?: number
  totalSteps: number
  completedSteps: number
  currentStep?: ExecutionStep
  steps: ExecutionStep[]
  overallProgress: number
  estimatedTimeRemaining?: number
  throughput?: number
  errorCount: number
}

interface RealTimeExecutionMonitorProps {
  workflowId?: string
  onPause?: () => void
  onResume?: () => void
  onStop?: () => void
}

const mockExecutionSession: ExecutionSession = {
  id: 'exec-123',
  workflowName: 'Data Processing Pipeline',
  status: 'running',
  startTime: Date.now() - 45000, // Started 45 seconds ago
  totalSteps: 8,
  completedSteps: 3,
  overallProgress: 37.5,
  estimatedTimeRemaining: 120000, // 2 minutes
  throughput: 2.1, // steps per minute
  errorCount: 0,
  steps: [
    {
      id: 'step-1',
      nodeId: 'fetch-data',
      nodeName: 'Fetch Data Source',
      status: 'completed',
      startTime: Date.now() - 45000,
      endTime: Date.now() - 40000,
      duration: 5000,
      progress: 100
    },
    {
      id: 'step-2',
      nodeId: 'validate-data',
      nodeName: 'Validate Input',
      status: 'completed',
      startTime: Date.now() - 40000,
      endTime: Date.now() - 35000,
      duration: 5000,
      progress: 100
    },
    {
      id: 'step-3',
      nodeId: 'transform-data',
      nodeName: 'Transform Data',
      status: 'completed',
      startTime: Date.now() - 35000,
      endTime: Date.now() - 20000,
      duration: 15000,
      progress: 100,
      metrics: {
        cpuUsage: 45,
        memoryUsage: 256,
        networkIO: 1024,
        diskIO: 512
      }
    },
    {
      id: 'step-4',
      nodeId: 'ai-analysis',
      nodeName: 'AI Analysis',
      status: 'running',
      startTime: Date.now() - 20000,
      progress: 65,
      metrics: {
        cpuUsage: 85,
        memoryUsage: 512,
        networkIO: 2048,
        diskIO: 256
      }
    },
    {
      id: 'step-5',
      nodeId: 'generate-insights',
      nodeName: 'Generate Insights',
      status: 'pending',
      progress: 0
    }
  ]
}

const RealTimeExecutionMonitor: React.FC<RealTimeExecutionMonitorProps> = ({
  // workflowId, // Reserved for future use
  onPause,
  onResume,
  onStop
}) => {
  const [execution, setExecution] = useState<ExecutionSession>(mockExecutionSession)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [autoScroll, setAutoScroll] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setExecution(prev => {
        if (prev.status !== 'running') return prev

        const runningStep = prev.steps.find(step => step.status === 'running')
        if (!runningStep) return prev

        // Update running step progress
        const updatedSteps = prev.steps.map(step => {
          if (step.id === runningStep.id && step.progress !== undefined && step.progress < 100) {
            return { ...step, progress: Math.min(100, step.progress + Math.random() * 5) }
          }
          return step
        })

        // Update overall progress
        const completedProgress = updatedSteps.reduce((sum, step) => {
          return sum + (step.progress || 0)
        }, 0) / prev.totalSteps

        return {
          ...prev,
          steps: updatedSteps,
          overallProgress: completedProgress,
          estimatedTimeRemaining: Math.max(0, (prev.estimatedTimeRemaining || 0) - 1000)
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'pending': return 'bg-gray-400'
      case 'paused': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let value = bytes
    let unitIndex = 0

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024
      unitIndex++
    }

    return `${value.toFixed(1)}${units[unitIndex]}`
  }

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const currentRunningTime = Date.now() - execution.startTime

  return (
    <div className="space-y-6">
      {/* Execution Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(execution.status)} animate-pulse`} />
              <div>
                <CardTitle className="text-lg">{execution.workflowName}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Execution ID: {execution.id}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
              </Badge>
              
              <div className="flex space-x-1">
                {execution.status === 'running' && (
                  <Button size="sm" variant="outline" onClick={onPause}>
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                {execution.status === 'paused' && (
                  <Button size="sm" variant="outline" onClick={onResume}>
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={onStop}>
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{execution.overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={execution.overallProgress} className="h-2" />
          </div>
          
          {/* Execution Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium">{formatDuration(currentRunningTime)}</div>
                <div className="text-muted-foreground">Running Time</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <div>
                <div className="font-medium">{execution.completedSteps}/{execution.totalSteps}</div>
                <div className="text-muted-foreground">Steps Complete</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <div>
                <div className="font-medium">{execution.throughput?.toFixed(1)}/min</div>
                <div className="text-muted-foreground">Throughput</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="font-medium">
                  {execution.estimatedTimeRemaining ? formatDuration(execution.estimatedTimeRemaining) : 'N/A'}
                </div>
                <div className="text-muted-foreground">ETA</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Execution Steps</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
              >
                Auto Scroll: {autoScroll ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {execution.steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleStepExpansion(step.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {expandedSteps.has(step.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {getStatusIcon(step.status)}
                      </div>
                      
                      <div>
                        <div className="font-medium text-sm">{step.nodeName}</div>
                        <div className="text-xs text-muted-foreground">
                          Step {index + 1} of {execution.totalSteps}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {step.progress !== undefined && (
                        <div className="text-sm font-medium">
                          {step.progress.toFixed(0)}%
                        </div>
                      )}
                      
                      {step.duration && (
                        <Badge variant="secondary" className="text-xs">
                          {formatDuration(step.duration)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {step.progress !== undefined && (
                    <Progress value={step.progress} className="h-1 mt-2" />
                  )}
                  
                  {expandedSteps.has(step.id) && (
                    <div className="mt-3 space-y-3 text-sm">
                      {/* Timing Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-muted-foreground">Start Time</div>
                          <div>{step.startTime ? new Date(step.startTime).toLocaleTimeString() : 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">End Time</div>
                          <div>{step.endTime ? new Date(step.endTime).toLocaleTimeString() : 'Running...'}</div>
                        </div>
                      </div>
                      
                      {/* System Metrics */}
                      {step.metrics && (
                        <div>
                          <div className="text-muted-foreground mb-2">Resource Usage</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>CPU Usage:</span>
                                <span>{step.metrics.cpuUsage}%</span>
                              </div>
                              <Progress value={step.metrics.cpuUsage} className="h-1" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Memory:</span>
                                <span>{formatBytes(step.metrics.memoryUsage || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Error Information */}
                      {step.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-red-800 font-medium">Error:</div>
                          <div className="text-red-700 text-sm">{step.error}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealTimeExecutionMonitor