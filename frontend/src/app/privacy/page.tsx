/**
 * Privacy Policy — launch-ready legal page for public beta.
 */

import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | MultiAgent AI',
  description: 'How MultiAgent AI collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">Home</Link>
          {' / '}
          Privacy Policy
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 26, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <p>
            MultiAgent AI (&quot;we&quot;, &quot;us&quot;) operates a multi-agent orchestration platform.
            This policy explains what we collect during the public beta and how we use it.
          </p>

          <h2 className="text-xl font-semibold pt-4">1. Information we collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Account details: email, name, and authentication provider data (Google/GitHub/email).</li>
            <li>Usage data: agent configurations, chat messages you send to agents, automation settings, and billing events.</li>
            <li>Technical data: IP address, browser type, and basic request logs for security and reliability.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">2. How we use information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and improve the product (agents, chat, automations, billing).</li>
            <li>To enforce plan quotas and prevent abuse.</li>
            <li>To communicate about account security, product changes, and support.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">3. AI provider processing</h2>
          <p>
            Prompts and agent outputs may be sent to third-party model providers you configure
            (for example Groq, OpenAI, or Anthropic) to generate responses. Their privacy terms also apply.
          </p>

          <h2 className="text-xl font-semibold pt-4">4. Retention &amp; deletion</h2>
          <p>
            You may request account deletion by contacting support. We retain billing records as required by law.
            During beta, some operational logs may be kept for a limited period to debug reliability issues.
          </p>

          <h2 className="text-xl font-semibold pt-4">5. Security</h2>
          <p>
            We use industry-standard safeguards (encrypted transport, access controls, authenticated APIs).
            No method of transmission or storage is 100% secure.
          </p>

          <h2 className="text-xl font-semibold pt-4">6. Contact</h2>
          <p>
            Questions about this policy: update the support email in your deployment config, or open an
            issue in your project repository.
          </p>
        </div>

        <div className="mt-12 flex gap-4 text-sm">
          <Link href="/terms" className="underline">Terms of Service</Link>
          <Link href="/register" className="underline">Create account</Link>
        </div>
      </div>
    </main>
  );
}
