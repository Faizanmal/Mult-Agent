'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Users,
  Globe,
  RefreshCw,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Cpu,
  HardDrive
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}

interface ChartData {
  name: string
  value: number
  time?: string
}

interface ExecutionTrendData {
  name: string
  success: number
  failure: number
  time: string
}

interface PerformanceData {
  name: string
  duration: number
  cpu: number
  memory: number
  network: number
}

const mockMetrics: MetricCard[] = [
  {
    title: 'Total Executions',
    value: '1,247',
    change: 12.5,
    trend: 'up',
    icon: <Activity className="w-4 h-4" />,
    color: '#3b82f6'
  },
  {
    title: 'Success Rate',
    value: '94.8%',
    change: 2.1,
    trend: 'up',
    icon: <CheckCircle className="w-4 h-4" />,
    color: '#10b981'
  },
  {
    title: 'Avg. Duration',
    value: '2.3s',
    change: -8.2,
    trend: 'down',
    icon: <Clock className="w-4 h-4" />,
    color: '#f59e0b'
  },
  {
    title: 'Active Workflows',
    value: 23,
    change: 5.0,
    trend: 'up',
    icon: <Zap className="w-4 h-4" />,
    color: '#8b5cf6'
  },
  {
    title: 'Error Rate',
    value: '5.2%',
    change: -15.3,
    trend: 'down',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: '#ef4444'
  },
  {
    title: 'Total Users',
    value: 156,
    change: 8.7,
    trend: 'up',
    icon: <Users className="w-4 h-4" />,
    color: '#06b6d4'
  }
]

const executionTrendData: ExecutionTrendData[] = [
  { name: '00:00', success: 45, failure: 3, time: '00:00' },
  { name: '04:00', success: 52, failure: 2, time: '04:00' },
  { name: '08:00', success: 78, failure: 5, time: '08:00' },
  { name: '12:00', success: 95, failure: 8, time: '12:00' },
  { name: '16:00', success: 112, failure: 6, time: '16:00' },
  { name: '20:00', success: 89, failure: 4, time: '20:00' },
]

const performanceData: PerformanceData[] = [
  { name: 'Mon', duration: 2.1, cpu: 45, memory: 67, network: 23 },
  { name: 'Tue', duration: 1.8, cpu: 52, memory: 71, network: 28 },
  { name: 'Wed', duration: 2.4, cpu: 48, memory: 63, network: 31 },
  { name: 'Thu', duration: 1.9, cpu: 41, memory: 59, network: 25 },
  { name: 'Fri', duration: 2.2, cpu: 55, memory: 73, network: 29 },
  { name: 'Sat', duration: 1.7, cpu: 38, memory: 55, network: 22 },
  { name: 'Sun', duration: 1.5, cpu: 35, memory: 51, network: 19 }
]

const workflowDistribution: ChartData[] = [
  { name: 'Data Processing', value: 35 },
  { name: 'API Integration', value: 25 },
  { name: 'AI/ML Tasks', value: 20 },
  { name: 'Notifications', value: 12 },
  { name: 'File Operations', value: 8 }
]

const errorTypes: ChartData[] = [
  { name: 'API Timeout', value: 45 },
  { name: 'Data Validation', value: 23 },
  { name: 'Network Error', value: 18 },
  { name: 'Authentication', value: 14 }
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
            <p className="text-3xl font-bold" style={{ color: metric.color }}>
              {metric.value}
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${metric.color}20`, color: metric.color }}
          >
            {metric.icon}
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          {metric.trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : metric.trend === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : (
            <div className="w-4 h-4" />
          )}
          <span 
            className={`text-sm font-medium ml-1 ${
              metric.trend === 'up' ? 'text-green-500' : 
              metric.trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}
          >
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">vs last period</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your workflow performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {mockMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Execution Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={executionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="success" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failure" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Workflow Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5" />
                  <span>Workflow Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workflowDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {workflowDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '2 min ago', event: 'Workflow "Data Processing" completed successfully', status: 'success' },
                  { time: '5 min ago', event: 'API integration workflow started', status: 'info' },
                  { time: '8 min ago', event: 'Error in email notification step', status: 'error' },
                  { time: '12 min ago', event: 'New workflow template created', status: 'success' },
                  { time: '15 min ago', event: 'User authenticated successfully', status: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <span className="text-sm">{activity.event}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Execution Duration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5" />
                  <span>Resource Utilization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#ef4444" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" />
                    <Line type="monotone" dataKey="network" stroke="#f59e0b" name="Network %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Optimization Score</h3>
                    <p className="text-2xl font-bold text-blue-600">87%</p>
                    <p className="text-sm text-muted-foreground">+5% this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Throughput</h3>
                    <p className="text-2xl font-bold text-green-600">234/h</p>
                    <p className="text-sm text-muted-foreground">workflows per hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Cache Hit Rate</h3>
                    <p className="text-2xl font-bold text-purple-600">92%</p>
                    <p className="text-sm text-muted-foreground">Excellent performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Error Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Error Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '10:32 AM', error: 'API timeout in data fetch step', severity: 'high' },
                    { time: '09:15 AM', error: 'Validation failed for user input', severity: 'medium' },
                    { time: '08:45 AM', error: 'Network connectivity issue', severity: 'high' },
                    { time: '07:22 AM', error: 'Authentication token expired', severity: 'low' }
                  ].map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={error.severity === 'high' ? 'destructive' : 
                                   error.severity === 'medium' ? 'default' : 'secondary'}
                        >
                          {error.severity}
                        </Badge>
                        <span className="text-sm">{error.error}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{error.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>User Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'John Doe', workflows: 23, lastActive: '2 hours ago' },
                    { user: 'Jane Smith', workflows: 18, lastActive: '4 hours ago' },
                    { user: 'Mike Johnson', workflows: 15, lastActive: '1 day ago' },
                    { user: 'Sarah Wilson', workflows: 12, lastActive: '2 days ago' }
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{user.user}</h4>
                        <p className="text-sm text-muted-foreground">{user.workflows} workflows created</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>API Endpoints</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { endpoint: '/api/workflows/execute', calls: 1247, avgResponse: '1.2s' },
                    { endpoint: '/api/workflows/save', calls: 342, avgResponse: '0.8s' },
                    { endpoint: '/api/agents/list', calls: 876, avgResponse: '0.3s' },
                    { endpoint: '/api/templates/library', calls: 234, avgResponse: '0.5s' }
                  ].map((api, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-mono">{api.endpoint}</span>
                        <span className="text-sm text-muted-foreground">{api.avgResponse}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(api.calls / 1247) * 100} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground">{api.calls}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAnalyticsDashboard