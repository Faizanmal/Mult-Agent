"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  Bot,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

// Sample data for charts
const performanceData = [
  { name: 'Mon', requests: 4000, latency: 45, errors: 20 },
  { name: 'Tue', requests: 5200, latency: 42, errors: 18 },
  { name: 'Wed', requests: 4800, latency: 48, errors: 25 },
  { name: 'Thu', requests: 6100, latency: 40, errors: 15 },
  { name: 'Fri', requests: 5800, latency: 43, errors: 22 },
  { name: 'Sat', requests: 3200, latency: 38, errors: 10 },
  { name: 'Sun', requests: 2900, latency: 35, errors: 8 },
];

const costData = [
  { name: 'Jan', groq: 120, openai: 340, anthropic: 180 },
  { name: 'Feb', groq: 150, openai: 320, anthropic: 200 },
  { name: 'Mar', groq: 180, openai: 280, anthropic: 220 },
  { name: 'Apr', groq: 220, openai: 250, anthropic: 190 },
  { name: 'May', groq: 280, openai: 220, anthropic: 210 },
  { name: 'Jun', groq: 320, openai: 180, anthropic: 180 },
];

const agentPerformanceData = [
  { name: 'Orchestrator', tasks: 1284, success: 98.5, color: '#8b5cf6' },
  { name: 'Vision', tasks: 856, success: 95.2, color: '#3b82f6' },
  { name: 'Reasoning', tasks: 2156, success: 99.1, color: '#10b981' },
  { name: 'Action', tasks: 4521, success: 97.8, color: '#f59e0b' },
  { name: 'Memory', tasks: 789, success: 100, color: '#06b6d4' },
];

const modelUsageData = [
  { name: 'Groq LLaMA', value: 45, color: '#8b5cf6' },
  { name: 'GPT-4', value: 25, color: '#10b981' },
  { name: 'Claude 3', value: 20, color: '#3b82f6' },
  { name: 'Other', value: 10, color: '#6b7280' },
];

// Stats cards data
const statsCards = [
  {
    title: 'Total Requests',
    value: '32.4K',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Activity,
    gradient: 'from-indigo-500 to-purple-500',
    description: 'This week',
  },
  {
    title: 'Avg Latency',
    value: '42ms',
    change: '-8.2%',
    changeType: 'positive' as const,
    icon: Zap,
    gradient: 'from-green-500 to-emerald-500',
    description: 'Faster than last week',
  },
  {
    title: 'Success Rate',
    value: '99.2%',
    change: '+0.3%',
    changeType: 'positive' as const,
    icon: CheckCircle2,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Excellent performance',
  },
  {
    title: 'Total Cost',
    value: '$1,284',
    change: '+5.4%',
    changeType: 'negative' as const,
    icon: DollarSign,
    gradient: 'from-orange-500 to-amber-500',
    description: 'This month',
  },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

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
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor performance, costs, and system health
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                  stat.gradient
                )} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                      stat.gradient
                    )}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                      className="flex items-center gap-1"
                    >
                      {stat.changeType === 'positive' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Request Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Request Volume</CardTitle>
                    <CardDescription>API requests over time</CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    +18%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRequests)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Latency & Errors Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Latency and error rates</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      Latency
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      Errors
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="latency"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="errors"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cost Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cost by Provider</CardTitle>
                    <CardDescription>Monthly spending breakdown</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      Groq
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      OpenAI
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      Anthropic
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="groq" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="openai" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="anthropic" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Model Usage Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Model Usage Distribution</CardTitle>
                <CardDescription>Request distribution by model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={modelUsageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {modelUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {modelUsageData.map((model) => (
                      <div key={model.name} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: model.color }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{model.name}</p>
                        </div>
                        <p className="text-sm font-bold">{model.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Agent Performance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Individual agent metrics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformanceData.map((agent, index) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      <Bot className="h-5 w-5" style={{ color: agent.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.tasks.toLocaleString()} tasks completed</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-lg font-bold">{agent.success}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="w-32">
                        <Progress 
                          value={agent.success} 
                          className="h-2"
                          style={{ 
                            backgroundColor: `${agent.color}20`,
                          }}
                        />
                      </div>
                    </div>
                    <Badge 
                      variant={agent.success >= 98 ? 'default' : agent.success >= 95 ? 'secondary' : 'destructive'}
                    >
                      {agent.success >= 98 ? 'Excellent' : agent.success >= 95 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>Automated optimization recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: 'Optimize Vision Agent',
                    description: 'Consider batching image requests to reduce latency by ~15%',
                    type: 'optimization',
                    impact: 'Medium',
                  },
                  {
                    title: 'Cost Saving Opportunity',
                    description: 'Switch 30% of simple queries to Groq for 40% cost reduction',
                    type: 'cost',
                    impact: 'High',
                  },
                  {
                    title: 'Peak Hour Alert',
                    description: 'Consider scaling during 2-4 PM when traffic spikes 3x',
                    type: 'alert',
                    impact: 'Medium',
                  },
                ].map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="p-4 rounded-xl bg-background border hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'optimization' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      {insight.type === 'cost' && <DollarSign className="h-4 w-4 text-green-500" />}
                      {insight.type === 'alert' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      <Badge variant="secondary" className="text-xs">{insight.impact} Impact</Badge>
                    </div>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
