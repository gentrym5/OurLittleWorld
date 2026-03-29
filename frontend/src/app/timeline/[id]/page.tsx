// src/app/timeline/[id]/page.tsx
// Memory detail page — Server Component

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@/lib/format';
import { USERS } from '@/lib/constants';
import type { TimelineEntry } from '@/types/index';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchEntry(id: string): Promise<TimelineEntry | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  try {
    const res = await fetch(`${base}/api/timeline/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<TimelineEntry>;
  } catch {
    return null;
  }
}

function getUserName(userID: number): string {
  if (userID === USERS.PARTNER_1.id) return USERS.PARTNER_1.name;
  return USERS.PARTNER_2.name;
}

function getUserPillColor(userID: number): string {
  if (userID === USERS.PARTNER_1.id) return 'bg-pink-light text-pink-deep';
  return 'bg-purple-soft text-purple-deep';
}

export default async function TimelineEntryPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await fetchEntry(id);

  if (!entry) {
    notFound();
  }

  const userName = getUserName(entry.userID);
  const pillColor = getUserPillColor(entry.userID);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href="/timeline"
        className="inline-flex items-center gap-1 font-sans text-caption text-text-muted hover:text-pink-deep transition-colors duration-150 mb-8"
      >
        &larr; Back to Timeline
      </Link>

      {/* Entry header */}
      <header className="mb-8">
        {/* Date badge */}
        <span className="inline-block px-3 py-1 rounded-pill bg-gold-light text-gold-warm font-sans text-caption font-bold mb-4">
          {formatDate(entry.timestamp)}
        </span>

        {/* Title */}
        <h1 className="font-serif text-h1 font-semibold text-text-primary leading-tight mb-3">
          {entry.title}
        </h1>

        {/* User tag */}
        <span
          className={`inline-block px-3 py-0.5 rounded-pill font-sans text-caption font-semibold ${pillColor}`}
        >
          {userName}
        </span>
      </header>

      <hr className="border-border mb-8" />

      {/* Full content */}
      <div className="font-sans text-body text-text-primary leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </div>
    </div>
  );
}
