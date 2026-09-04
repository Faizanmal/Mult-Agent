"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy /profile link → Settings profile tab */
export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}
