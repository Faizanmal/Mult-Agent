import './globals.css';
import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Multi-Agent Orchestration | The Future of AI Workflows',
  description: 'Enterprise-grade intelligent agent orchestration with real-time performance. Automate your workflows with multi-modal AI agents powered by Groq.',
  keywords: ['AI', 'Agents', 'Groq', 'Orchestration', 'Workflows', 'Automation', 'Enterprise AI'],
  openGraph: {
    title: 'Multi-Agent Orchestration | The Future of AI Workflows',
    description: 'Enterprise-grade intelligent agent orchestration with real-time performance.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}