// src/app/timeline/loading.tsx
// Suspense fallback for the Timeline route — skeleton spine with pulsing timeline cards

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function TimelineLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Page heading skeleton */}
      <div className="h-8 w-44 rounded-sm bg-border skeleton-shimmer mb-10" aria-hidden="true" />

      {/* Timeline spine + 4 skeleton cards with left border accent */}
      <div className="relative space-y-6 pl-6 border-l-2 border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative">
            {/* Timeline dot */}
            <div
              className="absolute -left-[1.4375rem] top-6 w-3 h-3 rounded-full bg-border skeleton-shimmer"
              aria-hidden="true"
            />
            <SkeletonCard lines={3} className="border-l-4 border-pink-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
