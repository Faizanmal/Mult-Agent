"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TeamSettingsPage() {
  const { user } = useAuth();

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    'You';

  const email = user?.email || '—';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Workspace access for your account. Multi-seat invites ship after beta.
          </p>
        </div>
        <Button className="flex items-center gap-2" disabled title="Coming soon">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Card className="mb-6 border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Public beta is single-user workspaces. You are the owner of this workspace.
          Team invites and role management will unlock on Pro after launch hardening.
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Members</CardTitle>
            <CardDescription>
              People with access to your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{displayName}</p>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Badge variant="outline">You</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                Owner
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
