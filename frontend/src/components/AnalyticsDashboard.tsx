'use client';

import { useEffect, useState } from 'react';
import { useAnalytics, DashboardData, SystemHealth } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, MessageSquare, TrendingUp } from 'lucide-react';

export function AnalyticsDashboard() {
  const { getDashboard, getSystemHealth, loading } = useAnalytics();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [dashboardData, healthData] = await Promise.all([
        getDashboard(),
        getSystemHealth(),
      ]);
      setDashboard(dashboardData);
      setHealth(healthData);
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [getDashboard, getSystemHealth]);

  if (loading && !dashboard) {
    return <div className="flex items-center justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* System Health Badge */}
      {health && (
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <Badge
            variant={health.status === 'healthy' ? 'default' : 'destructive'}
            className="text-sm"
          >
            <Activity className="mr-2 h-4 w-4" />
            System {health.status}
          </Badge>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Agents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.agents?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.agents?.active || 0} active
            </p>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.sessions?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.sessions?.active || 0} active
            </p>
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.messages?.today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        {/* Executions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.executions?.success_rate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.executions?.week_total || 0} executions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <ServiceStatus
                name="Redis Cache"
                status={health.services.redis.status}
                enabled={health.services.redis.enabled}
              />
              <ServiceStatus
                name="Azure CosmosDB"
                status={health.services.cosmosdb.status}
                enabled={health.services.cosmosdb.enabled}
              />
              <ServiceStatus
                name="Database"
                status={health.services.database.status}
                enabled={health.services.database.enabled}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ServiceStatus({
  name,
  status,
  enabled,
}: {
  name: string;
  status: string;
  enabled: boolean;
}) {
  const statusColor = status === 'up' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="flex items-center space-x-3">
      <div className={`h-3 w-3 rounded-full ${statusColor}`} />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {enabled ? status : 'Disabled'}
        </p>
      </div>
    </div>
  );
}
