/**
 * Terms of Service — launch-ready legal page for public beta.
 */

import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | MultiAgent AI',
  description: 'Terms governing use of the MultiAgent AI public beta.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:underline">Home</Link>
          {' / '}
          Terms of Service
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 26, 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            By creating an account or using MultiAgent AI, you agree to these terms.
            The product is offered as a <strong>public beta</strong> and may change without notice.
          </p>

          <h2 className="text-xl font-semibold pt-4">1. The service</h2>
          <p>
            MultiAgent AI lets you create and run AI agents, chat sessions, and automations.
            Features may be incomplete, rate-limited, or temporarily unavailable during beta.
          </p>

          <h2 className="text-xl font-semibold pt-4">2. Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate registration information.</li>
            <li>You are responsible for activity under your account and for keeping credentials secure.</li>
            <li>One person per free account unless we approve otherwise.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">3. Acceptable use</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Do not use the service for illegal activity, abuse, spam, or malware.</li>
            <li>Do not attempt to bypass quotas, auth, or security controls.</li>
            <li>Do not upload content you do not have rights to process.</li>
          </ul>

          <h2 className="text-xl font-semibold pt-4">4. Plans &amp; billing</h2>
          <p>
            Free tier includes limited monthly messages. Paid plans are billed via Stripe when configured.
            Unused free quota does not roll over. We may change limits with reasonable notice.
          </p>

          <h2 className="text-xl font-semibold pt-4">5. AI outputs</h2>
          <p>
            Agent outputs can be wrong, biased, or incomplete. You are responsible for reviewing results
            before acting on them. We do not guarantee fitness for a particular purpose.
          </p>

          <h2 className="text-xl font-semibold pt-4">6. Availability &amp; liability</h2>
          <p>
            The beta is provided &quot;as is&quot; without warranties. To the maximum extent allowed by law,
            our liability is limited to the fees you paid us in the 3 months before a claim (or $0 on the free plan).
          </p>

          <h2 className="text-xl font-semibold pt-4">7. Termination</h2>
          <p>
            You may stop using the service at any time. We may suspend accounts that violate these terms
            or threaten the stability/security of the platform.
          </p>

          <h2 className="text-xl font-semibold pt-4">8. Contact</h2>
          <p>
            For terms questions, use the support contact configured for your deployment.
          </p>
        </div>

        <div className="mt-12 flex gap-4 text-sm">
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          <Link href="/register" className="underline">Create account</Link>
        </div>
      </div>
    </main>
  );
}
