'use client';

// src/app/error.tsx
// Global error boundary — client component required by Next.js App Router

import { useEffect } from 'react';
import Link from 'next/link';
import { HeartCrack } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development; in production this would go to an error service
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-pink-light/60 to-purple-soft/60">
      {/* Broken heart illustration */}
      <HeartCrack
        size={96}
        className="text-pink-soft animate-heartPulse mb-6"
        aria-hidden="true"
      />

      <h1 className="font-serif text-h1 text-text-primary text-center mb-3">
        Oops...
      </h1>

      <p className="font-sans text-body text-text-muted text-center max-w-[480px] mb-2">
        Something went a little wrong.
      </p>
      <p className="font-sans text-body text-text-muted text-center max-w-[480px] mb-8">
        Something unexpected happened on our end. Please try again.
      </p>

      {error.digest && (
        <p className="font-sans text-caption text-text-muted mb-6">
          Error code: {error.digest}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={reset}
          className="rounded-pill"
        >
          Try Again
        </Button>
        <Link href="/">
          <Button variant="ghost" size="lg">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
