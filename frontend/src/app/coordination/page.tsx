import CoordinationDashboard from '@/components/coordination/CoordinationDashboard';

export default function CoordinationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Multi-Agent Coordination</h1>
        <p className="text-muted-foreground mt-2">
          Coordinate multiple AI agents using various strategies to solve complex tasks
        </p>
      </div>
      <CoordinationDashboard />
    </div>
  );
}
