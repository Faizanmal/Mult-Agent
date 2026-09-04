"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function GitHubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing GitHub sign-in...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      setStatus('success');
      setMessage('Signed in with GitHub!');
      setTimeout(() => router.push('/dashboard'), 1000);
      return;
    }

    if (error) {
      setStatus('error');
      setMessage(`GitHub sign-in was denied: ${error}`);
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Invalid callback parameters.');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    const exchange = async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/api/auth/github/callback/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
          { headers: { 'Accept': 'application/json' } }
        );

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || 'GitHub authentication failed.');
        }

        const data = await resp.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('auth_token', data.access_token);
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
          setStatus('success');
          setMessage('Signed in with GitHub!');
          setTimeout(() => router.push('/dashboard'), 800);
        } else {
          throw new Error('No token received from server.');
        }
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Authentication failed.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    exchange();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-lg font-medium text-green-600">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-lg font-medium text-destructive">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
