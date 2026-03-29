// src/app/loading.tsx
// Global loading fallback — Suspense boundary skeleton

import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading() {
  return (
    <div className="min-h-screen bg-purple-soft/30 px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-5">
        {/* Skeleton heading */}
        <div
          className="h-7 w-60 rounded-sm bg-border skeleton-shimmer"
          aria-hidden="true"
        />
        {/* Skeleton body lines */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />
          <div className="h-4 w-4/5 rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />
          <div className="h-4 w-11/12 rounded-sm bg-border skeleton-shimmer" aria-hidden="true" />
        </div>
        {/* Skeleton card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </div>
  );
}
