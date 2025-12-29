"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Bot,
  Zap,
  GitBranch,
  Shield,
  CreditCard,
  Users,
  Sparkles,
  Archive,
  Star,
  StarOff,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Notification types with icons and colors
const notificationTypes = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500/20' },
  error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  agent: { icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
  workflow: { icon: GitBranch, color: 'text-indigo-500', bg: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  security: { icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  billing: { icon: CreditCard, color: 'text-cyan-500', bg: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
};

// Sample notifications
const notifications = [
  {
    id: '1',
    type: 'agent',
    title: 'Agent "Data Analyzer" completed task',
    description: 'Successfully processed 1,542 records in 2m 15s',
    timestamp: '2 min ago',
    read: false,
    starred: false,
    action: { label: 'View Results', href: '#' },
  },
  {
    id: '2',
    type: 'error',
    title: 'Workflow execution failed',
    description: 'Customer Support Workflow encountered an error at step 3',
    timestamp: '15 min ago',
    read: false,
    starred: true,
    action: { label: 'View Details', href: '#' },
  },
  {
    id: '3',
    type: 'success',
    title: 'Report generated successfully',
    description: 'Weekly Agent Performance Report is ready for download',
    timestamp: '1 hour ago',
    read: false,
    starred: false,
    action: { label: 'Download', href: '#' },
  },
  {
    id: '4',
    type: 'warning',
    title: 'API rate limit approaching',
    description: 'You\'ve used 85% of your monthly API quota',
    timestamp: '2 hours ago',
    read: true,
    starred: false,
    action: { label: 'Upgrade Plan', href: '#' },
  },
  {
    id: '5',
    type: 'security',
    title: 'New login detected',
    description: 'A new login was detected from San Francisco, US',
    timestamp: '3 hours ago',
    read: true,
    starred: false,
    action: { label: 'Review Activity', href: '#' },
  },
  {
    id: '6',
    type: 'info',
    title: 'New feature available',
    description: 'Check out our new MCP Tools integration for enhanced agent capabilities',
    timestamp: '5 hours ago',
    read: true,
    starred: false,
    action: { label: 'Learn More', href: '#' },
  },
  {
    id: '7',
    type: 'billing',
    title: 'Invoice paid',
    description: 'Your payment of $49.00 for Pro Plan was successful',
    timestamp: '1 day ago',
    read: true,
    starred: false,
    action: { label: 'View Invoice', href: '#' },
  },
  {
    id: '8',
    type: 'workflow',
    title: 'Workflow scheduled',
    description: 'Daily Data Sync workflow is scheduled to run at 2 AM',
    timestamp: '1 day ago',
    read: true,
    starred: false,
    action: { label: 'Edit Schedule', href: '#' },
  },
];

// Notification preferences
const notificationPreferences = [
  { category: 'Agents', items: ['Agent completed', 'Agent failed', 'Agent started'] },
  { category: 'Workflows', items: ['Workflow completed', 'Workflow failed', 'Workflow scheduled'] },
  { category: 'System', items: ['Errors', 'Warnings', 'Security alerts'] },
  { category: 'Billing', items: ['Payment received', 'Invoice due', 'Usage alerts'] },
];

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [notificationList, setNotificationList] = useState(notifications);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const unreadCount = notificationList.filter(n => !n.read).length;
  const starredCount = notificationList.filter(n => n.starred).length;

  const filteredNotifications = notificationList.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'starred') return notification.starred;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotificationList(notificationList.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, read: true })));
  };

  const toggleStarred = (id: string) => {
    setNotificationList(notificationList.map(n =>
      n.id === id ? { ...n, starred: !n.starred } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotificationList(notificationList.filter(n => n.id !== id));
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
              <Bell className="h-8 w-8 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount} unread</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your agent activities and system alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="inbox" className="gap-2">
                Inbox
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="starred" className="gap-2">
                Starred
                {starredCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {starredCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* All Notifications Tab */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notification, index) => {
                      const typeConfig = notificationTypes[notification.type as keyof typeof notificationTypes] || notificationTypes.info;
                      const TypeIcon = typeConfig.icon;

                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                            !notification.read && "bg-primary/5"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                            typeConfig.bg
                          )}>
                            <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={cn(
                                  "font-medium",
                                  !notification.read && "text-foreground",
                                  notification.read && "text-muted-foreground"
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {notification.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {notification.timestamp}
                                </span>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                            </div>
                            {notification.action && (
                              <Button
                                variant="link"
                                className="h-auto p-0 mt-2 text-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {notification.action.label}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarred(notification.id);
                              }}
                            >
                              {notification.starred ? (
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <StarOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleStarred(notification.id)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  {notification.starred ? 'Unstar' : 'Star'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredNotifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold">No notifications</h3>
                      <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {notificationList.filter(n => !n.read).map((notification) => {
                    const typeConfig = notificationTypes[notification.type as keyof typeof notificationTypes] || notificationTypes.info;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer bg-primary/5"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", typeConfig.bg)}>
                          <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                      </div>
                    );
                  })}
                  {notificationList.filter(n => !n.read).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="font-semibold">All caught up!</h3>
                      <p className="text-sm text-muted-foreground">No unread notifications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Starred Tab */}
          <TabsContent value="starred" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {notificationList.filter(n => n.starred).map((notification) => {
                    const typeConfig = notificationTypes[notification.type as keyof typeof notificationTypes] || notificationTypes.info;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", typeConfig.bg)}>
                          <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleStarred(notification.id)}
                        >
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        </Button>
                      </div>
                    );
                  })}
                  {notificationList.filter(n => n.starred).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Star className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold">No starred notifications</h3>
                      <p className="text-sm text-muted-foreground">Star important notifications to find them easily</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {notificationPreferences.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.items.map((item, index) => (
                    <React.Fragment key={item}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item}</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for {item.toLowerCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                      {index < category.items.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
