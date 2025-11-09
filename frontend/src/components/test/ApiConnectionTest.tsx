/**
 * API Connection Test Component
 * Simple component to test API connectivity and CRUD operations
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAgents, useCreateAgent, useSessions, useCreateSession } from '@/hooks/useApi';
import { Loader2, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ApiConnectionTest() {
  const [newAgentName, setNewAgentName] = useState('');
  const [newSessionName, setNewSessionName] = useState('');

  // API hooks
  const { data: agentsResponse, isLoading: loadingAgents, error: agentsError, refetch: refetchAgents } = useAgents();
  const { data: sessionsResponse, isLoading: loadingSessions, error: sessionsError, refetch: refetchSessions } = useSessions();
  
  const createAgentMutation = useCreateAgent();
  const createSessionMutation = useCreateSession();

  const agents = agentsResponse?.results || [];
  const sessions = sessionsResponse?.results || [];

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an agent name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAgentMutation.mutateAsync({
        name: newAgentName,
        type: 'reasoning',
        capabilities: ['test', 'demo'],
        status: 'idle',
      });
      setNewAgentName('');
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a session name',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSessionMutation.mutateAsync({
        name: newSessionName,
      });
      setNewSessionName('');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const getStatus = (isLoading: boolean, error: Error | null, data: unknown) => {
    if (isLoading) return { icon: <Loader2 className="h-4 w-4 animate-spin" />, badge: 'loading', text: 'Loading...' };
    if (error) return { icon: <XCircle className="h-4 w-4 text-red-500" />, badge: 'error', text: error.message };
    if (data) return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, badge: 'success', text: 'Connected' };
    return { icon: <XCircle className="h-4 w-4 text-gray-500" />, badge: 'unknown', text: 'Unknown' };
  };

  const agentStatus = getStatus(loadingAgents, agentsError, agentsResponse);
  const sessionStatus = getStatus(loadingSessions, sessionsError, sessionsResponse);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>Test frontend-backend connectivity and basic CRUD operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Agents API</h3>
                <div className="flex items-center gap-2">
                  {agentStatus.icon}
                  <Badge variant={agentStatus.badge === 'success' ? 'default' : agentStatus.badge === 'error' ? 'destructive' : 'outline'}>
                    {agentStatus.text}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchAgents()}
                    disabled={loadingAgents}
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingAgents ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Found {agents.length} agents
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Sessions API</h3>
                <div className="flex items-center gap-2">
                  {sessionStatus.icon}
                  <Badge variant={sessionStatus.badge === 'success' ? 'default' : sessionStatus.badge === 'error' ? 'destructive' : 'outline'}>
                    {sessionStatus.text}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchSessions()}
                    disabled={loadingSessions}
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingSessions ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Found {sessions.length} sessions
              </div>
            </div>
          </div>

          {/* Quick Create Tests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium">Test Create Agent</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Agent name..."
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  disabled={createAgentMutation.isPending}
                />
                <Button
                  onClick={handleCreateAgent}
                  disabled={createAgentMutation.isPending || !newAgentName.trim()}
                >
                  {createAgentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Test Create Session</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Session name..."
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  disabled={createSessionMutation.isPending}
                />
                <Button
                  onClick={handleCreateSession}
                  disabled={createSessionMutation.isPending || !newSessionName.trim()}
                >
                  {createSessionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {(agentsError || sessionsError) && (
            <div className="space-y-2">
              <h3 className="font-medium text-red-600">Connection Errors</h3>
              <div className="space-y-2 text-sm">
                {agentsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <strong>Agents API:</strong> {agentsError.message}
                  </div>
                )}
                {sessionsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <strong>Sessions API:</strong> {sessionsError.message}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Make sure the Django backend is running on {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' || 'http://127.0.0.1:8000'}
              </div>
            </div>
          )}

          {/* Recent Items */}
          {(agents.length > 0 || sessions.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Recent Agents</h3>
                  <div className="space-y-1">
                    {agents.slice(0, 3).map((agent) => (
                      <div key={agent.id} className="text-sm p-2 bg-muted/50 rounded">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-muted-foreground ml-2">({agent.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sessions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Recent Sessions</h3>
                  <div className="space-y-1">
                    {sessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="text-sm p-2 bg-muted/50 rounded">
                        <span className="font-medium">{session.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({session.agents?.length || 0} agents)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}