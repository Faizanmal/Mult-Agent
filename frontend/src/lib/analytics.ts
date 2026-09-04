/**
 * Lightweight product funnel analytics.
 * Persists events locally and optionally forwards to NEXT_PUBLIC_ANALYTICS_ENDPOINT.
 */

export type FunnelEvent =
  | 'signup_completed'
  | 'first_agent_created'
  | 'agent_created'
  | 'first_message_sent'
  | 'message_sent'
  | 'upgrade_clicked'
  | 'quota_limit_hit'
  | 'feedback_submitted'
  | 'integration_connected';

type EventProps = Record<string, string | number | boolean | null | undefined>;

const STORAGE_KEY = 'product_analytics_events';
const FLAGS_KEY = 'product_analytics_flags';

function readFlags(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(FLAGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeFlags(flags: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
}

function appendLocal(event: FunnelEvent, props: EventProps) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as unknown[];
    existing.push({
      event,
      props,
      ts: new Date().toISOString(),
      path: window.location.pathname,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(-200)));
  } catch {
    /* ignore quota errors */
  }
}

export function trackEvent(event: FunnelEvent, props: EventProps = {}) {
  if (typeof window === 'undefined') return;

  appendLocal(event, props);

  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', event, props);
  }

  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token');

  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ event, props, ts: new Date().toISOString() }),
    keepalive: true,
  }).catch(() => {});
}

/** Fire once per browser (e.g. first agent / first message). */
export function trackOnce(event: FunnelEvent, props: EventProps = {}) {
  const flags = readFlags();
  if (flags[event]) return;
  flags[event] = true;
  writeFlags(flags);
  trackEvent(event, props);
}
