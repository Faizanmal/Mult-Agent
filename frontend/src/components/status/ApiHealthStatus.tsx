/**
 * Backend API Health Check and Status Component
 * Monitors backend connectivity and displays system status
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHealthCheck } from '@/hooks/useApi';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ApiHealthStatusProps {
  className?: string;
}

export function ApiHealthStatus({ className }: ApiHealthStatusProps) {
  const { data: healthStatus, isLoading, error, refetch } = useHealthCheck();

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (error || healthStatus?.status !== 'healthy') return <XCircle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="outline">Checking...</Badge>;
    if (error || healthStatus?.status !== 'healthy') return <Badge variant="destructive">Offline</Badge>;
    return <Badge variant="default" className="bg-green-500">Online</Badge>;
  };

  const getStatusMessage = () => {
    if (isLoading) return 'Checking backend connection...';
    if (error) return 'Unable to connect to backend';
    return healthStatus?.message || 'Backend connection status unknown';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            Backend Status
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
          
          {error && (
            <div className="text-xs text-red-600">
              <p>Error: {error.message}</p>
              <p className="mt-1">Please ensure the backend is running on port 8000</p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' || 'http://127.0.0.1:8000'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}