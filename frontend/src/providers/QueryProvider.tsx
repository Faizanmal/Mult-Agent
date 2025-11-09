/**
 * React Query Provider
 * Provides data fetching, caching, and synchronization capabilities
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Global defaults
          staleTime: 1000 * 60 * 5, // 5 minutes
          retry: (failureCount, error) => {
            // Don't retry for 4xx errors except 401
            if (error && typeof error === 'object' && 'response' in error) {
              const response = error.response as { status?: number };
              if (response.status && response.status >= 400 && response.status < 500 && response.status !== 401) {
                return false;
              }
            }
            return failureCount < 3;
          },
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}