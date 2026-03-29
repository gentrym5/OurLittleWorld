// src/app/not-found.tsx
// 404 page with romantic message and home link

import Link from 'next/link';
import { Heart } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-pink-light/60 to-purple-soft/60">
      {/* Heart icon */}
      <Heart
        size={80}
        className="text-pink-soft fill-pink-soft animate-heartPulse mb-6"
        aria-hidden="true"
      />

      {/* 404 code */}
      <p className="font-sans text-caption text-text-muted mb-3">404</p>

      <h1 className="font-serif text-h1 text-text-primary text-center mb-3">
        Lost in Love
      </h1>

      <p className="font-sans text-body text-text-muted text-center max-w-[480px] mb-8">
        We couldn&apos;t find that page. Maybe it wandered off somewhere romantic.
        Don&apos;t worry — let&apos;s take you back home.
      </p>

      <Link href="/">
        <Button variant="primary" size="lg" className="rounded-pill">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
