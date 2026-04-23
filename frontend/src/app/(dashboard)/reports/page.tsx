"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  Clock,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  Share2,
  Filter,
  TrendingUp,
  PieChart,
  BarChart3,
  LineChart,
  FileSpreadsheet,
  File,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Star,
  Users,
  Mail,
  Sparkles,
  Printer,
  Edit,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Report templates
const reportTemplates = [
  { id: '1', name: 'Agent Performance', description: 'Detailed agent metrics and KPIs', icon: TrendingUp, category: 'analytics', popular: true },
  { id: '2', name: 'API Usage', description: 'API calls, latency, and error rates', icon: BarChart3, category: 'analytics', popular: true },
  { id: '3', name: 'Cost Analysis', description: 'Token usage and cost breakdown', icon: PieChart, category: 'finance', popular: true },
  { id: '4', name: 'Workflow Summary', description: 'Workflow execution statistics', icon: LineChart, category: 'operations', popular: false },
  { id: '5', name: 'User Activity', description: 'User engagement and usage patterns', icon: Users, category: 'analytics', popular: false },
  { id: '6', name: 'Error Report', description: 'System errors and exceptions', icon: XCircle, category: 'operations', popular: false },
];

// Generated reports
const reports = [
  {
    id: '1',
    name: 'Weekly Agent Performance Report',
    template: 'Agent Performance',
    status: 'completed',
    generatedAt: '2024-01-15 10:30',
    generatedBy: 'John Doe',
    format: 'pdf',
    size: '2.4 MB',
    schedule: 'Weekly',
  },
  {
    id: '2',
    name: 'Monthly Cost Analysis - January',
    template: 'Cost Analysis',
    status: 'completed',
    generatedAt: '2024-01-14 09:00',
    generatedBy: 'System',
    format: 'xlsx',
    size: '1.8 MB',
    schedule: 'Monthly',
  },
  {
    id: '3',
    name: 'Daily API Usage Report',
    template: 'API Usage',
    status: 'generating',
    generatedAt: '2024-01-15 14:30',
    generatedBy: 'System',
    format: 'pdf',
    size: '-',
    schedule: 'Daily',
  },
  {
    id: '4',
    name: 'Q4 2023 Executive Summary',
    template: 'Custom',
    status: 'completed',
    generatedAt: '2024-01-10 11:15',
    generatedBy: 'Jane Smith',
    format: 'pdf',
    size: '5.2 MB',
    schedule: null,
  },
  {
    id: '5',
    name: 'Error Analysis Report',
    template: 'Error Report',
    status: 'failed',
    generatedAt: '2024-01-15 08:00',
    generatedBy: 'System',
    format: 'pdf',
    size: '-',
    schedule: 'Daily',
    error: 'Data source unavailable',
  },
];

// Scheduled reports
const scheduledReports = [
  { id: '1', name: 'Daily Agent Metrics', template: 'Agent Performance', schedule: 'Daily at 8 AM', recipients: ['john@example.com', 'jane@example.com'], enabled: true },
  { id: '2', name: 'Weekly Cost Report', template: 'Cost Analysis', schedule: 'Mondays at 9 AM', recipients: ['finance@example.com'], enabled: true },
  { id: '3', name: 'Monthly Executive Summary', template: 'Custom', schedule: '1st of month', recipients: ['exec@example.com'], enabled: false },
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [ , setSelectedReport] = useState<typeof reports[0] | null>(null);

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-primary' },
    { label: 'Generated Today', value: 3, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Scheduled', value: scheduledReports.length, icon: Calendar, color: 'text-blue-500' },
    { label: 'Templates', value: reportTemplates.length, icon: Copy, color: 'text-purple-500' },
  ];

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'generating':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Generating</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate and manage analytics reports
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={cn("p-2 rounded-lg bg-muted/50", stat.color)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          {/* All Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "hover:shadow-md transition-shadow",
                    report.status === 'failed' && "border-red-500/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Report Icon */}
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                          report.status === 'completed' && "bg-green-500/10",
                          report.status === 'generating' && "bg-blue-500/10",
                          report.status === 'failed' && "bg-red-500/10"
                        )}>
                          {report.status === 'generating' ? (
                            <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                          ) : (
                            getFormatIcon(report.format)
                          )}
                        </div>

                        {/* Report Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{report.name}</h3>
                            {getStatusBadge(report.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Template: {report.template}</span>
                            <span>•</span>
                            <span>{report.generatedAt}</span>
                            {report.schedule && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {report.schedule}
                                </Badge>
                              </>
                            )}
                          </div>
                          {report.error && (
                            <p className="text-sm text-red-500 mt-1">{report.error}</p>
                          )}
                        </div>

                        {/* Report Meta */}
                        <div className="hidden sm:flex flex-col items-end gap-1 text-sm text-muted-foreground">
                          <span>By {report.generatedBy}</span>
                          {report.size !== '-' && <span>{report.size}</span>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {report.status === 'completed' && (
                            <Button variant="outline" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reportTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110">
                          <template.icon className="h-6 w-6 text-primary" />
                        </div>
                        {template.popular && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <Badge variant="outline" className="capitalize">{template.category}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automatically generated reports on a schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduledReports.map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{schedule.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {schedule.schedule}
                        <span>•</span>
                        <Mail className="h-3 w-3" />
                        {schedule.recipients.length} recipients
                      </div>
                    </div>
                    <Switch checked={schedule.enabled} />
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Report Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Generate a new report from a template or create a custom one
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name</Label>
                <Input id="name" placeholder="My Custom Report" />
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Schedule this report</p>
                  <p className="text-sm text-muted-foreground">Automatically generate on a schedule</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
