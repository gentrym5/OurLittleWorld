'use client';

// src/components/timeline/Timeline.tsx
// Vertical timeline with alternating left/right cards and IntersectionObserver fade-in

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import type { TimelineEntry } from '@/types/index';
import TimelineCard from './TimelineCard';

export interface TimelineProps {
  entries: TimelineEntry[];
}

function TimelineItem({
  entry,
  index,
}: {
  entry: TimelineEntry;
  index: number;
}) {
  const side = index % 2 === 0 ? 'left' : 'right';
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove('opacity-0', 'translate-y-4');
          el.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        // Initial hidden state for fade-in
        'opacity-0 translate-y-4 transition-all duration-500 ease-out',
        // Mobile: single column, full width
        'w-full',
        // Desktop: half-width positioned to left or right of center spine
        'md:w-[calc(50%-2rem)]',
        side === 'left' ? 'md:self-start md:mr-auto' : 'md:self-end md:ml-auto',
      )}
    >
      <TimelineCard entry={entry} side={side} />
    </div>
  );
}

export default function Timeline({ entries }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-h2 text-text-muted">
          Your story starts here
        </p>
        <p className="font-sans text-body text-text-muted mt-2">
          Add your first memory to begin the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Center spine — desktop only */}
      <div
        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-purple-light -translate-x-1/2"
        aria-hidden="true"
      />

      {/* Mobile spine — left-aligned */}
      <div
        className="md:hidden absolute left-4 top-0 bottom-0 w-px border-l-2 border-purple-light"
        aria-hidden="true"
      />

      {/* Entries */}
      <div className="flex flex-col gap-10 md:gap-12 pl-10 md:pl-0">
        {entries.map((entry, index) => (
          <TimelineItem key={entry.entryID} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}
