"use client";

import React, { useState } from 'react';
import { ChevronDown, Plus, Building2, User } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function WorkspaceSwitcher() {
  const [activeWorkspace, setActiveWorkspace] = useState('Personal Workspace');

  const workspaces = [
    { id: '1', name: 'Personal Workspace', type: 'personal' },
    { id: '2', name: 'Acme Corp', type: 'team' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 px-3 py-2 h-10 w-[240px] justify-between border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                {activeWorkspace.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{activeWorkspace}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem 
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.name)}
            className={`flex items-center gap-2 cursor-pointer ${activeWorkspace === workspace.name ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
          >
            {workspace.type === 'team' ? (
              <Building2 className="h-4 w-4 text-blue-500" />
            ) : (
              <User className="h-4 w-4 text-purple-500" />
            )}
            <span className="flex-1 truncate">{workspace.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400">
          <Plus className="h-4 w-4" />
          <span>Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
