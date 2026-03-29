// src/components/timeline/TimelineCard.tsx
// Single memory card rendered on the timeline spine

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';
import { USERS } from '@/lib/constants';
import type { TimelineEntry } from '@/types/index';

const PREVIEW_MAX = 150;

export interface TimelineCardProps {
  entry: TimelineEntry;
  side: 'left' | 'right';
}

function getUserLabel(userID: number): { name: string; color: string } {
  if (userID === USERS.PARTNER_1.id) {
    return { name: USERS.PARTNER_1.name, color: 'bg-pink-light text-pink-deep' };
  }
  return { name: USERS.PARTNER_2.name, color: 'bg-purple-soft text-purple-deep' };
}

export default function TimelineCard({ entry, side }: TimelineCardProps) {
  const user = getUserLabel(entry.userID);
  const preview =
    entry.content.length > PREVIEW_MAX
      ? entry.content.slice(0, PREVIEW_MAX).trimEnd() + '…'
      : entry.content;

  return (
    <div className="relative">
      {/* Connector line from card to spine dot */}
      <div
        className={cn(
          'hidden md:block absolute top-6 h-px w-6 bg-border',
          side === 'left' ? 'right-0 translate-x-full' : 'left-0 -translate-x-full',
        )}
        aria-hidden="true"
      />

      {/* Spine dot — visible only on desktop, positioned on the spine edge */}
      <div
        className={cn(
          'hidden md:block absolute top-[18px] w-3.5 h-3.5 rounded-circle',
          'bg-pink-soft border-[3px] border-purple-light',
          side === 'left'
            ? 'right-[-2.125rem]'  // aligns with center spine from left card
            : 'left-[-2.125rem]',  // aligns with center spine from right card
        )}
        aria-hidden="true"
      />

      {/* Card */}
      <article
        className={cn(
          'bg-site-white-pure shadow-subtle rounded-xl p-4 transition-shadow duration-200 hover:shadow-hover',
        )}
      >
        {/* Date badge */}
        <div className="mb-2">
          <span className="inline-block px-3 py-0.5 rounded-pill bg-gold-light text-gold-warm font-sans text-caption font-bold">
            {formatDate(entry.timestamp)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-h3 font-bold text-text-primary mb-2 leading-snug">
          {entry.title}
        </h3>

        {/* Content preview */}
        {entry.content && (
          <p className="font-sans text-body text-text-muted mb-3 leading-relaxed">
            {preview}
          </p>
        )}

        {/* Read more link */}
        {entry.content.length > PREVIEW_MAX && (
          <Link
            href={`/timeline/${entry.entryID}`}
            className="inline-flex items-center gap-1 font-sans text-caption font-semibold text-pink-deep hover:text-pink-soft transition-colors duration-150"
          >
            Read more &rarr;
          </Link>
        )}

        {/* User pill */}
        <div className="mt-3 flex justify-end">
          <span
            className={cn(
              'inline-block px-2.5 py-0.5 rounded-pill font-sans text-caption font-semibold',
              user.color,
            )}
          >
            {user.name}
          </span>
        </div>
      </article>
    </div>
  );
}
