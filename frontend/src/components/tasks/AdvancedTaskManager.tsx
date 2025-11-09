'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckSquare,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Star,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'feature' | 'bug' | 'improvement' | 'research' | 'documentation'
  assignee?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  subtasks: SubTask[]
  estimatedHours: number
  actualHours?: number
  dependencies: string[]
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface TaskStats {
  total: number
  completed: number
  inProgress: number
  todo: number
  blocked: number
  completionRate: number
  avgCompletionTime: number
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Enhanced AI Workflow Assistant',
    description: 'Implement advanced AI-powered workflow recommendations and auto-generation capabilities',
    status: 'in-progress',
    priority: 'high',
    category: 'feature',
    assignee: 'John Doe',
    dueDate: '2024-01-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    tags: ['ai', 'workflow', 'automation'],
    estimatedHours: 40,
    actualHours: 25,
    dependencies: [],
    subtasks: [
      { id: '1-1', title: 'Design AI recommendation engine', completed: true },
      { id: '1-2', title: 'Implement natural language workflow generation', completed: true },
      { id: '1-3', title: 'Add workflow optimization suggestions', completed: false },
      { id: '1-4', title: 'Create AI chat interface', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Real-time Execution Monitor',
    description: 'Build comprehensive real-time monitoring for workflow execution with performance metrics',
    status: 'completed',
    priority: 'high',
    category: 'feature',
    assignee: 'Jane Smith',
    dueDate: '2024-01-10',
    createdAt: '2023-12-20',
    updatedAt: '2024-01-08',
    tags: ['monitoring', 'real-time', 'performance'],
    estimatedHours: 30,
    actualHours: 28,
    dependencies: [],
    subtasks: [
      { id: '2-1', title: 'Design execution progress UI', completed: true },
      { id: '2-2', title: 'Implement WebSocket connections', completed: true },
      { id: '2-3', title: 'Add performance metrics tracking', completed: true },
      { id: '2-4', title: 'Create execution history view', completed: true }
    ]
  },
  {
    id: '3',
    title: 'Custom Node Components',
    description: 'Develop advanced custom node components with dynamic ports and enhanced visualization',
    status: 'todo',
    priority: 'medium',
    category: 'improvement',
    assignee: 'Mike Johnson',
    dueDate: '2024-01-20',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    tags: ['ui', 'components', 'visualization'],
    estimatedHours: 25,
    dependencies: ['1'],
    subtasks: [
      { id: '3-1', title: 'Design custom node architecture', completed: false },
      { id: '3-2', title: 'Implement dynamic port system', completed: false },
      { id: '3-3', title: 'Add node grouping functionality', completed: false }
    ]
  },
  {
    id: '4',
    title: 'Performance Optimization',
    description: 'Optimize application performance and reduce bundle size',
    status: 'blocked',
    priority: 'medium',
    category: 'improvement',
    assignee: 'Sarah Wilson',
    dueDate: '2024-01-25',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-09',
    tags: ['performance', 'optimization', 'bundle-size'],
    estimatedHours: 20,
    actualHours: 5,
    dependencies: ['1', '2'],
    subtasks: [
      { id: '4-1', title: 'Analyze bundle size', completed: true },
      { id: '4-2', title: 'Implement code splitting', completed: false },
      { id: '4-3', title: 'Optimize React Flow performance', completed: false }
    ]
  }
]

const AdvancedTaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  // const [selectedTask, setSelectedTask] = useState<Task | null>(null) // Reserved for task details view
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'feature',
    estimatedHours: 8,
    tags: []
  })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  const taskStats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    completionRate: (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100,
    avgCompletionTime: tasks.filter(t => t.actualHours).reduce((acc, t) => acc + (t.actualHours || 0), 0) / tasks.filter(t => t.actualHours).length || 0
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature': return <Star className="w-4 h-4" />
      case 'bug': return <AlertCircle className="w-4 h-4" />
      case 'improvement': return <TrendingUp className="w-4 h-4" />
      case 'research': return <Target className="w-4 h-4" />
      case 'documentation': return <CheckSquare className="w-4 h-4" />
      default: return <CheckSquare className="w-4 h-4" />
    }
  }

  const handleCreateTask = useCallback(() => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || 'New Task',
      description: newTask.description || '',
      status: 'todo',
      priority: newTask.priority || 'medium',
      category: newTask.category || 'feature',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newTask.tags || [],
      subtasks: [],
      estimatedHours: newTask.estimatedHours || 8,
      dependencies: []
    }
    
    setTasks(prev => [...prev, task])
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'feature',
      estimatedHours: 8,
      tags: []
    })
    setShowCreateDialog(false)
  }, [newTask])

  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    ))
  }, [])

  // const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
  //   setTasks(prev => prev.map(task => 
  //     task.id === taskId 
  //       ? {
  //           ...task,
  //           subtasks: task.subtasks.map(subtask =>
  //             subtask.id === subtaskId
  //               ? { ...subtask, completed: !subtask.completed }
  //               : subtask
  //           ),
  //           updatedAt: new Date().toISOString()
  //         }
  //       : task
  //   ))
  // }, []) // Reserved for subtask management

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length
    const totalSubtasks = task.subtasks.length
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(task.category)}
              <CardTitle className="text-base">{task.title}</CardTitle>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
          
          {/* Progress */}
          {totalSubtasks > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {/* Task Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-3">
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{task.assignee}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex space-x-2">
            {task.status !== 'completed' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleUpdateTaskStatus(task.id, 
                  task.status === 'todo' ? 'in-progress' : 'completed'
                )}
              >
                {task.status === 'todo' ? 'Start' : 'Complete'}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost"
              // onClick={() => setSelectedTask(task)} // Reserved for task details
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Organize and track your development tasks
          </p>
        </div>
        
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Todo</p>
                <p className="text-2xl font-bold">{taskStats.todo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold">{taskStats.blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{taskStats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="John Doe">John Doe</SelectItem>
            <SelectItem value="Jane Smith">Jane Smith</SelectItem>
            <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
            <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No tasks found</p>
            <p className="text-sm">Try adjusting your filters or create a new task</p>
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Title</label>
              <Input
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe the task..."
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={newTask.category} 
                  onValueChange={(value: Task['category']) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bug">Bug Fix</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                placeholder="8"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseInt(e.target.value) || 8 })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdvancedTaskManager