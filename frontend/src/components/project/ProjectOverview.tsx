'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Rocket,
  Users,
  Workflow,
  BarChart3,
  Settings,
  Zap,
  Brain,
  Eye,
  Target,
  Layers,
  GitBranch,
  Calendar
} from 'lucide-react'

import TaskManager from '@/components/tasks/TaskManager'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import WorkflowBuilder from '@/components/workflows/WorkflowBuilder'

interface FeatureModule {
  id: string
  name: string
  description: string
  category: 'core' | 'advanced' | 'integration' | 'analytics'
  status: 'completed' | 'in-progress' | 'planned' | 'beta'
  progress: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  dependencies: string[]
  estimatedHours: number
  actualHours: number
  tags: string[]
  icon: React.ReactNode
  component?: React.ComponentType
}

const FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'workflow-builder',
    name: 'Enhanced Workflow Builder',
    description: 'Advanced visual workflow designer with drag-and-drop interface, scheduling, and real-time execution monitoring',
    category: 'core',
    status: 'in-progress',
    progress: 75,
    priority: 'high',
    dependencies: [],
    estimatedHours: 24,
    actualHours: 18,
    tags: ['workflow', 'visual-editor', 'automation'],
    icon: <Workflow className="h-5 w-5" />,
    component: WorkflowBuilder
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics and performance monitoring with real-time charts and insights',
    category: 'analytics',
    status: 'completed',
    progress: 100,
    priority: 'medium',
    dependencies: ['workflow-builder'],
    estimatedHours: 16,
    actualHours: 16,
    tags: ['analytics', 'monitoring', 'charts'],
    icon: <BarChart3 className="h-5 w-5" />,
    component: AnalyticsDashboard
  },
  {
    id: 'task-manager',
    name: 'Project Task Manager',
    description: 'Advanced task management system with project tracking, progress monitoring, and team collaboration',
    category: 'core',
    status: 'completed',
    progress: 100,
    priority: 'high',
    dependencies: [],
    estimatedHours: 12,
    actualHours: 10,
    tags: ['tasks', 'project-management', 'collaboration'],
    icon: <Target className="h-5 w-5" />,
    component: TaskManager
  },
  {
    id: 'ai-agent-selection',
    name: 'AI-Powered Agent Selection',
    description: 'Intelligent agent matching system that automatically selects optimal agents based on task requirements',
    category: 'advanced',
    status: 'planned',
    progress: 0,
    priority: 'high',
    dependencies: ['analytics-dashboard'],
    estimatedHours: 20,
    actualHours: 0,
    tags: ['ai', 'automation', 'optimization'],
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 'multimodal-processor',
    name: 'Multi-Modal Processing',
    description: 'Advanced file processing with AI-powered content analysis for images, audio, video, and documents',
    category: 'advanced',
    status: 'completed',
    progress: 100,
    priority: 'medium',
    dependencies: [],
    estimatedHours: 22,
    actualHours: 22,
    tags: ['multimodal', 'ai', 'file-processing'],
    icon: <Eye className="h-5 w-5" />
  },
  {
    id: 'real-time-collaboration',
    name: 'Real-Time Collaboration',
    description: 'Multi-user editing with conflict resolution, real-time sync, and collaborative features',
    category: 'integration',
    status: 'planned',
    progress: 0,
    priority: 'medium',
    dependencies: ['workflow-builder', 'task-manager'],
    estimatedHours: 28,
    actualHours: 0,
    tags: ['collaboration', 'real-time', 'websocket'],
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'api-integration-hub',
    name: 'API Integration Hub',
    description: 'Connect with external services, webhooks, and third-party APIs for seamless workflow integration',
    category: 'integration',
    status: 'in-progress',
    progress: 30,
    priority: 'high',
    dependencies: ['workflow-builder'],
    estimatedHours: 18,
    actualHours: 5,
    tags: ['api', 'integration', 'webhooks'],
    icon: <Layers className="h-5 w-5" />
  },
  {
    id: 'advanced-scheduling',
    name: 'Advanced Scheduling Engine',
    description: 'Cron-like scheduling system with retry mechanisms, error handling, and debugging capabilities',
    category: 'core',
    status: 'planned',
    progress: 0,
    priority: 'medium',
    dependencies: ['workflow-builder'],
    estimatedHours: 20,
    actualHours: 0,
    tags: ['scheduling', 'cron', 'automation'],
    icon: <Calendar className="h-5 w-5" />
  },
  {
    id: 'template-marketplace',
    name: 'Template Marketplace',
    description: 'Community-driven template sharing platform with discovery, rating, and customization features',
    category: 'integration',
    status: 'planned',
    progress: 0,
    priority: 'low',
    dependencies: ['workflow-builder', 'real-time-collaboration'],
    estimatedHours: 25,
    actualHours: 0,
    tags: ['templates', 'community', 'marketplace'],
    icon: <GitBranch className="h-5 w-5" />
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Advanced performance monitoring, bottleneck detection, and automated optimization suggestions',
    category: 'analytics',
    status: 'beta',
    progress: 60,
    priority: 'medium',
    dependencies: ['analytics-dashboard'],
    estimatedHours: 15,
    actualHours: 9,
    tags: ['performance', 'optimization', 'monitoring'],
    icon: <Zap className="h-5 w-5" />
  }
]

const ProjectOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedFeature, setSelectedFeature] = useState<FeatureModule | null>(null)

  const getStatusColor = (status: FeatureModule['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200'
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'beta': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'planned': return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getPriorityColor = (priority: FeatureModule['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getCategoryColor = (category: FeatureModule['category']) => {
    switch (category) {
      case 'core': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'advanced': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'integration': return 'text-green-600 bg-green-100 border-green-200'
      case 'analytics': return 'text-orange-600 bg-orange-100 border-orange-200'
    }
  }

  const calculateOverallProgress = () => {
    const totalModules = FEATURE_MODULES.length
    const totalProgress = FEATURE_MODULES.reduce((sum, module) => sum + module.progress, 0)
    return Math.round(totalProgress / totalModules)
  }

  const getModulesByCategory = (category: FeatureModule['category']) => {
    return FEATURE_MODULES.filter(module => module.category === category)
  }

  const getModulesByStatus = (status: FeatureModule['status']) => {
    return FEATURE_MODULES.filter(module => module.status === status)
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Rocket className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold">Enhanced Multi-Agent System</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive AI-powered workflow orchestration platform with advanced automation, 
          real-time collaboration, and intelligent agent coordination capabilities
        </p>
        
        {/* Overall Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span>Project Completion</span>
            <span className="font-semibold">{calculateOverallProgress()}%</span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {getModulesByStatus('completed').length} of {FEATURE_MODULES.length} modules completed
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{getModulesByStatus('completed').length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{getModulesByStatus('in-progress').length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{getModulesByStatus('planned').length}</p>
                <p className="text-sm text-muted-foreground">Planned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{getModulesByStatus('beta').length}</p>
                <p className="text-sm text-muted-foreground">Beta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Feature Overview</TabsTrigger>
          <TabsTrigger value="workflow-builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Feature Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['core', 'advanced', 'integration', 'analytics'].map(category => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center space-x-2">
                    <Badge className={`border ${getCategoryColor(category as FeatureModule['category'])}`}>
                      {category}
                    </Badge>
                    <span>{category} Features</span>
                  </CardTitle>
                  <CardDescription>
                    {category === 'core' && 'Essential system functionality and workflow management'}
                    {category === 'advanced' && 'AI-powered intelligent features and automation'}
                    {category === 'integration' && 'External service connections and collaboration'}
                    {category === 'analytics' && 'Performance monitoring and data visualization'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getModulesByCategory(category as FeatureModule['category']).map(module => (
                      <div 
                        key={module.id} 
                        className="p-3 border rounded-lg hover:shadow-sm cursor-pointer transition-all"
                        onClick={() => setSelectedFeature(module)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {module.icon}
                            <span className="font-medium">{module.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs border ${getStatusColor(module.status)}`}>
                              {module.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={`text-xs border ${getPriorityColor(module.priority)}`}>
                              {module.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-muted-foreground">
                              Progress: {module.progress}%
                            </div>
                          </div>
                          <Progress value={module.progress} className="w-24 h-1" />
                        </div>
                        {module.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {module.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Details Modal */}
          {selectedFeature && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {selectedFeature.icon}
                    <span>{selectedFeature.name}</span>
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFeature(null)}
                  >
                    ×
                  </Button>
                </div>
                <CardDescription>{selectedFeature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Status & Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status:</span>
                          <Badge className={`text-xs border ${getStatusColor(selectedFeature.status)}`}>
                            {selectedFeature.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Progress:</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={selectedFeature.progress} className="w-16 h-2" />
                            <span className="text-sm font-medium">{selectedFeature.progress}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Priority:</span>
                          <Badge className={`text-xs border ${getPriorityColor(selectedFeature.priority)}`}>
                            {selectedFeature.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Effort Tracking</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Estimated Hours:</span>
                          <span>{selectedFeature.estimatedHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Actual Hours:</span>
                          <span>{selectedFeature.actualHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span>{selectedFeature.estimatedHours - selectedFeature.actualHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Dependencies</h4>
                      {selectedFeature.dependencies.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No dependencies</p>
                      ) : (
                        <div className="space-y-1">
                          {selectedFeature.dependencies.map(depId => {
                            const dep = FEATURE_MODULES.find(m => m.id === depId)
                            return dep ? (
                              <div key={depId} className="flex items-center space-x-2 text-sm">
                                {dep.icon}
                                <span>{dep.name}</span>
                                <Badge className={`text-xs border ${getStatusColor(dep.status)}`}>
                                  {dep.status.replace('-', ' ')}
                                </Badge>
                              </div>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeature.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflow-builder">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProjectOverview