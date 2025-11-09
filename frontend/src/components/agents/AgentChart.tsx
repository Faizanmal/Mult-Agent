"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

interface AgentMetric {
  timestamp: number;
  latency: number;
  throughput: number;
  accuracy: number;
}

const chartConfig = {
  latency: { label: "Latency (ms)", color: "#3B82F6" },
  throughput: { label: "Throughput", color: "#10B981" },
  accuracy: { label: "Accuracy (%)", color: "#8B5CF6" }
};

export default function AgentChart({ metrics }: { metrics: AgentMetric[] }) {
  const chartData = metrics.map(metric => ({
    time: new Date(metric.timestamp).toLocaleTimeString(),
    latency: metric.latency,
    throughput: metric.throughput,
    accuracy: metric.accuracy * 100
  }));

  return (
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="latency" stroke="var(--color-latency)" strokeWidth={2} />
            <Line type="monotone" dataKey="throughput" stroke="var(--color-throughput)" strokeWidth={2} />
            <Line type="monotone" dataKey="accuracy" stroke="var(--color-accuracy)" strokeWidth={2} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}