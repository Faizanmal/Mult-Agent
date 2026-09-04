"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Search,
  Settings,
  Moon,
  Sun,
  Menu,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  Command,
  Zap,
  Activity,
  MessageSquareWarning,
} from 'lucide-react';
import { openReportIssueDialog } from '@/components/support/ReportIssueDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TopbarProps {
  sidebarCollapsed?: boolean;
  onMenuClick?: () => void;
}

export function Topbar({ sidebarCollapsed = false, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [ , setSearchOpen] = useState(false);

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    user?.email ||
    'User';
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    if (segments.length === 0) return 'Dashboard';
    return segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border/50",
        "bg-background/80 backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "left-[72px]" : "left-[260px]"
      )}
    >
      <div className="flex items-center gap-4 px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title with Breadcrumb */}
        <div className="flex items-center gap-3">
          <motion.h1
            key={pathname}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold"
          >
            {getPageTitle()}
          </motion.h1>
          
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">System Online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6">
        {/* Quick Actions */}
        <TooltipProvider>
          <div className="hidden md:flex items-center gap-1">
            {/* System Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Activity className="h-4 w-4 text-green-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>All systems operational</p>
              </TooltipContent>
            </Tooltip>

            {/* Quick Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Zap className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Actions</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Search Button */}
        <Button
          variant="outline"
          className="hidden sm:flex items-center gap-2 rounded-xl border-dashed text-muted-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </Button>

        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="text-xs">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {[
                {
                  title: 'Workflow completed',
                  description: 'Data processing pipeline finished successfully',
                  time: '2 min ago',
                  unread: true,
                },
                {
                  title: 'New agent deployed',
                  description: 'Vision Analyst agent is now active',
                  time: '1 hour ago',
                  unread: true,
                },
                {
                  title: 'System update',
                  description: 'Platform updated to version 2.1.0',
                  time: '3 hours ago',
                  unread: true,
                },
              ].map((notification, i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{notification.title}</span>
                    {notification.unread && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{notification.description}</span>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ opacity: 0, rotate: -90, scale: 0 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isDark ? 'Light mode' : 'Dark mode'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-xl pl-2 pr-3">
              <div className="relative h-8 w-8">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                    <div className="absolute inset-0.5 rounded-full bg-background flex items-center justify-center">
                      <span className="text-xs font-semibold">{initials}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{roleLabel}</span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/billing" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Plans & usage
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => openReportIssueDialog()}
            >
              <MessageSquareWarning className="h-4 w-4 mr-2" />
              Report an issue
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Topbar;
