/**
 * React Query hooks for API integration
 * Provides data fetching, caching, and synchronization for the frontend
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import apiClient, { 
  Agent, 
  Session, 
  Message, 
  Task, 
  PaginatedResponse 
} from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const QUERY_KEYS = {
  agents: 'agents',
  agent: (id: string) => ['agents', id],
  sessions: 'sessions',
  session: (id: string) => ['sessions', id],
  messages: (sessionId: string) => ['messages', sessionId],
  tasks: 'tasks',
  task: (id: string) => ['tasks', id],
  performance: 'performance',
  agentPerformance: (agentId: string) => ['performance', 'agent', agentId],
  groqModels: 'groqModels',
} as const;

// Agent Hooks
export function useAgents(): UseQueryResult<PaginatedResponse<Agent>, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.agents],
    queryFn: () => apiClient.getAgents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAgent(id: string): UseQueryResult<Agent, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.agent(id),
    queryFn: () => apiClient.getAgent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAgent(): UseMutationResult<Agent, Error, Partial<Agent>> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (agentData: Partial<Agent>) => apiClient.createAgent(agentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.agents] });
      toast({
        title: 'Success',
        description: 'Agent created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create agent',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAgent(): UseMutationResult<Agent, Error, { id: string; data: Partial<Agent> }> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) => 
      apiClient.updateAgent(id, data),
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.agents] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agent(updatedAgent.id) });
      toast({
        title: 'Success',
        description: 'Agent updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update agent',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAgent(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.agents] });
      toast({
        title: 'Success',
        description: 'Agent deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete agent',
        variant: 'destructive',
      });
    },
  });
}

export function useActivateAgent(): UseMutationResult<Agent, Error, string> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.activateAgent(id),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.agents] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agent(agent.id) });
      toast({
        title: 'Success',
        description: `Agent ${agent.name} activated`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate agent',
        variant: 'destructive',
      });
    },
  });
}

export function useDeactivateAgent(): UseMutationResult<Agent, Error, string> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deactivateAgent(id),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.agents] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agent(agent.id) });
      toast({
        title: 'Success',
        description: `Agent ${agent.name} deactivated`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate agent',
        variant: 'destructive',
      });
    },
  });
}

// Session Hooks
export function useSessions(): UseQueryResult<PaginatedResponse<Session>, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.sessions],
    queryFn: () => apiClient.getSessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSession(id: string): UseQueryResult<Session, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => apiClient.getSession(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateSession(): UseMutationResult<Session, Error, { name: string }> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: { name: string }) => apiClient.createSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sessions] });
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create session',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSession(): UseMutationResult<Session, Error, { id: string; data: Partial<Session> }> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Session> }) => 
      apiClient.updateSession(id, data),
    onSuccess: (updatedSession) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sessions] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(updatedSession.id) });
      toast({
        title: 'Success',
        description: 'Session updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update session',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSession(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sessions] });
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete session',
        variant: 'destructive',
      });
    },
  });
}

// Message Hooks
export function useMessages(sessionId: string): UseQueryResult<PaginatedResponse<Message>, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.messages(sessionId),
    queryFn: () => apiClient.getMessages(sessionId),
    enabled: !!sessionId && sessionId !== 'initializing...', // Don't query while initializing
    refetchInterval: 10000, // Refetch every 10 seconds (less aggressive)
    staleTime: 0, // Always consider stale
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (session doesn't exist)
      if (error?.message?.includes('404')) {
        console.log('Session not found - stopping retries');
        return false;
      }
      return failureCount < 2; // Reduced retries
    },
    retryDelay: 2000, // Fixed delay
  });
}

export function useSendMessage(): UseMutationResult<Message, Error, {
  sessionId: string;
  messageData: {
    content: string;
    message_type: 'text' | 'image' | 'file' | 'command';
    metadata?: Record<string, unknown>;
  };
}> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, messageData }) => 
      apiClient.sendMessage(sessionId, messageData),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(message.session) });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });
}

// Task Hooks
export function useTasks(): UseQueryResult<PaginatedResponse<Task>, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks],
    queryFn: () => apiClient.getTasks(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTask(id: string): UseQueryResult<Task, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.task(id),
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateTask(): UseMutationResult<Task, Error, Partial<Task>> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: Partial<Task>) => apiClient.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTask(): UseMutationResult<Task, Error, { id: string; data: Partial<Task> }> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      apiClient.updateTask(id, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(updatedTask.id) });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    },
  });
}

// Performance Hooks
export function usePerformanceMetrics(): UseQueryResult<Record<string, unknown>, Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.performance],
    queryFn: () => apiClient.getPerformanceMetrics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useAgentPerformance(agentId: string): UseQueryResult<Record<string, unknown>, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.agentPerformance(agentId),
    queryFn: () => apiClient.getAgentPerformance(agentId),
    enabled: !!agentId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// Groq Integration Hooks
export function useGroqModels(): UseQueryResult<string[], Error> {
  return useQuery({
    queryKey: [QUERY_KEYS.groqModels],
    queryFn: () => apiClient.getGroqModels(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useChatWithGroq(): UseMutationResult<Record<string, unknown>, Error, {
  messages: Array<{ role: string; content: string }>;
  model?: string;
}> {
  return useMutation({
    mutationFn: ({ messages, model }) => apiClient.chatWithGroq(messages, model),
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to chat with Groq',
        variant: 'destructive',
      });
    },
  });
}

// Health Check Hook
export function useHealthCheck(): UseQueryResult<{ status: string; message: string }, Error> {
  return useQuery({
    queryKey: ['healthCheck'],
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}