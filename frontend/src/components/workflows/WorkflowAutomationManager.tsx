'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Bot,
  Zap,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Activity,
  BarChart3,
  GitBranch,
  Lightbulb
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AutomationRule {
  id: string
  name: string
  type: 'schedule' | 'trigger' | 'condition' | 'optimization'
  enabled: boolean
  config: Record<string, any>
  lastRun?: string
  nextRun?: string
  success: boolean
  description: string
}

interface AutomationMetrics {
  rulesActive: number
  totalExecutions: number
  successRate: number
  timeSaved: number
  optimizationsSuggested: number
  errorsResolved: number
}

interface WorkflowAutomationManagerProps {
  workflowId: string
  onAutomationUpdate?: (rule: AutomationRule) => void
}

const WorkflowAutomationManager: React.FC<WorkflowAutomationManagerProps> = ({
  workflowId,
  onAutomationUpdate
}) => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'auto-save-1',
      name: 'Auto-Save Workflow',
      type: 'schedule',
      enabled: true,
      config: { interval: 300, backupCount: 5 },
      lastRun: '2 minutes ago',
      nextRun: '3 minutes',
      success: true,
      description: 'Automatically saves workflow every 5 minutes'
    },
    {
      id: 'error-detect-1',
      name: 'Error Detection & Recovery',
      type: 'trigger',
      enabled: true,
      config: { maxRetries: 3, notifyOnFailure: true },
      lastRun: '1 hour ago',
      success: true,
      description: 'Detects execution errors and attempts automatic recovery'
    },
    {
      id: 'performance-opt-1',
      name: 'Performance Optimization',
      type: 'optimization',
      enabled: false,
      config: { threshold: 85, autoApply: false },
      lastRun: 'Never',
      success: false,
      description: 'Analyzes and suggests workflow performance improvements'
    },
    {
      id: 'smart-routing-1',
      name: 'Smart Node Routing',
      type: 'condition',
      enabled: true,
      config: { adaptivePaths: true, loadBalancing: true },
      lastRun: '30 minutes ago',
      success: true,
      description: 'Intelligently routes workflow execution based on conditions'
    }
  ])

  const [metrics, setMetrics] = useState<AutomationMetrics>({
    rulesActive: 3,
    totalExecutions: 247,
    successRate: 94.7,
    timeSaved: 127,
    optimizationsSuggested: 12,
    errorsResolved: 8
  })

  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleType, setNewRuleType] = useState<string>('')
  const [showNewRuleForm, setShowNewRuleForm] = useState(false)
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [smartSuggestions, setSmartSuggestions] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalExecutions: prev.totalExecutions + Math.floor(Math.random() * 3),
        timeSaved: prev.timeSaved + Math.floor(Math.random() * 2)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const toggleRule = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    )

    const rule = automationRules.find(r => r.id === ruleId)
    if (rule) {
      toast({
        title: `Automation ${rule.enabled ? 'Disabled' : 'Enabled'}`,
        description: `${rule.name} has been ${rule.enabled ? 'disabled' : 'enabled'}`,
      })
      
      if (onAutomationUpdate) {
        onAutomationUpdate({ ...rule, enabled: !rule.enabled })
      }
    }
  }

  const addNewRule = () => {
    if (!newRuleName || !newRuleType) return

    const newRule: AutomationRule = {
      id: `custom-${Date.now()}`,
      name: newRuleName,
      type: newRuleType as any,
      enabled: true,
      config: {},
      success: false,
      description: `Custom ${newRuleType} automation rule`
    }

    setAutomationRules(prev => [...prev, newRule])
    setNewRuleName('')
    setNewRuleType('')
    setShowNewRuleForm(false)

    toast({
      title: 'Automation Rule Added',
      description: `${newRuleName} has been created successfully`,
    })
  }

  const executeRule = (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId)
    if (!rule) return

    // Simulate rule execution
    setAutomationRules(prev => 
      prev.map(r => 
        r.id === ruleId 
          ? { ...r, lastRun: 'Just now', success: true }
          : r
      )
    )

    toast({
      title: 'Automation Executed',
      description: `${rule.name} has been executed successfully`,
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Clock className="w-4 h-4" />
      case 'trigger': return <Zap className="w-4 h-4" />
      case 'condition': return <GitBranch className="w-4 h-4" />
      case 'optimization': return <TrendingUp className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'schedule': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'trigger': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'condition': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'optimization': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Workflow Automation
          </h2>
          <p className="text-muted-foreground">
            Manage automated rules and intelligent workflow optimizations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="automation-enabled"
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
            <Label htmlFor="automation-enabled">Master Enable</Label>
          </div>
          
          <Button onClick={() => setShowNewRuleForm(!showNewRuleForm)}>
            Add Rule
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.rulesActive}</p>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.totalExecutions}</p>
                <p className="text-xs text-muted-foreground">Executions</p>
              </div>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.successRate}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.timeSaved}h</p>
                <p className="text-xs text-muted-foreground">Time Saved</p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.optimizationsSuggested}</p>
                <p className="text-xs text-muted-foreground">Optimizations</p>
              </div>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{metrics.errorsResolved}</p>
                <p className="text-xs text-muted-foreground">Errors Fixed</p>
              </div>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* New Rule Form */}
          {showNewRuleForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Automation Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-type">Rule Type</Label>
                    <Select value={newRuleType} onValueChange={setNewRuleType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="schedule">Schedule</SelectItem>
                        <SelectItem value="trigger">Trigger</SelectItem>
                        <SelectItem value="condition">Condition</SelectItem>
                        <SelectItem value="optimization">Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addNewRule}>Create Rule</Button>
                  <Button variant="outline" onClick={() => setShowNewRuleForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Rules List */}
          <div className="space-y-3">
            {automationRules.map((rule) => (
              <Card key={rule.id} className={rule.enabled ? '' : 'opacity-60'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(rule.type)}`}>
                        {getTypeIcon(rule.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {rule.type}
                          </Badge>
                          {rule.lastRun && (
                            <span className="text-xs text-muted-foreground">
                              Last run: {rule.lastRun}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {rule.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => executeRule(rule.id)}
                        disabled={!rule.enabled}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {/* Configure rule */}}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                        disabled={!automationEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations for your workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Performance Optimization Opportunity
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        Your workflow could be 23% faster by parallelizing nodes 4-7. 
                        Would you like to apply this optimization automatically?
                      </p>
                      <Button size="sm" className="mt-2" variant="outline">
                        Apply Optimization
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Resource Usage Insight
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                        Your automation rules have saved 127 hours of manual work this month. 
                        Consider adding error handling rules to improve reliability.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                        Potential Issue Detected
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                        Node "Data Processing" shows 12% failure rate. Consider adding retry logic 
                        or reviewing input validation rules.
                      </p>
                      <Button size="sm" className="mt-2" variant="outline">
                        Create Auto-Fix Rule
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure global automation preferences and behaviors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smart-suggestions">Smart Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered workflow optimization suggestions
                    </p>
                  </div>
                  <Switch
                    id="smart-suggestions"
                    checked={smartSuggestions}
                    onCheckedChange={setSmartSuggestions}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Auto-Save Frequency</Label>
                  <Select defaultValue="300">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                      <SelectItem value="600">Every 10 minutes</SelectItem>
                      <SelectItem value="1800">Every 30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Error Recovery Attempts</Label>
                  <Select defaultValue="3">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Performance Monitoring</Label>
                  <div className="space-y-2">
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      Real-time performance monitoring: 33% CPU utilization
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WorkflowAutomationManager