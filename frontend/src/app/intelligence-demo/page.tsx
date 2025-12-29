import MultiModalDashboard from '@/components/intelligence/MultiModalDashboard';

export default function IntelligencePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Multi-Modal Intelligence</h1>
        <p className="text-muted-foreground mt-2">
          Process and analyze text, images, audio, and video with AI-powered cross-modal insights
        </p>
      </div>
      <MultiModalDashboard />
    </div>
  );
}
